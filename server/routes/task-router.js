const express = require("express");
const TaskService = require("../services/task-service");
const { authenticateToken } = require("../middlewares/auth-middleware");
const { upload, compressImages } = require("../middlewares/upload-middleware");
const logger = require("../utils/logger");

const router = express.Router();

// Middleware to authenticate all routes
router.use(authenticateToken);

// Fetch all tasks with optional filters
router.get("/", async (req, res) => {
  try {
    const tasks = await TaskService.fetchTasks(req.query);
    
    return res.status(200).json(tasks);
  } catch (error) {
    logger.error(`[FETCH TASKS ERROR]: ${error.message}`);
    
    return res.status(500).json({ error: "An error occurred while fetching tasks" });
  }
});

// Fetch a specific task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await TaskService.fetchTaskById(req.params.id);

    return res.status(200).json(task);
  } catch (error) {
    logger.error("[FETCH TASK BY ID ERROR]:", error.message);

    return res.status(404).json({ error: "Task not found" });
  }
});

// Create a new task with optional file uploads or JSON body
router.post(
  "/",
  upload.array("files", 10),
  compressImages,
  async (req, res) => {
    try {
      let taskData = req.body;

      taskData.createdBy = req.user.id;
      let filePaths = [];
      // FormData ile gelen dosyaları işle
      if (req.files && req.files.length > 0) {
        filePaths = req.files.map((file) => file.path);
      }

      // Eğer JSON body olarak dosya yolları gönderilmişse ekle
      if (taskData.filePaths && Array.isArray(taskData.filePaths)) {
        filePaths = filePaths.concat(taskData.filePaths);
      }
      // Task oluştur
      const task = await TaskService.insertTask({ ...taskData, filePaths });

      return res.status(201).json(task);
    } catch (error) {
      logger.error(`[CREATE TASK ERROR]: ${error.message}`);

      return res
        .status(500)
        .json({ error: "An error occurred while creating the task" });
    }
  }
);

// Update a task or change its status
router.put(
  "/:id",
  upload.array("files", 10),
  compressImages,
  async (req, res) => {
    try {
      const { newState, ...updateData } = req.body;
      let filePaths = [];
      if (req.files && req.files?.length > 0) {
        filePaths = req.files.map((file) => file.path);
      }

      let task = await TaskService.fetchTaskById(req.params.id);
      if (!task) throw new Error("Task not found");

      // Change state if specified
      if (newState) {
        task = await TaskService.changeTaskState(req.params.id, newState);
      }

      // Update other fields
      task = await TaskService.updateTask(req.params.id, {
        ...updateData,
        ...(filePaths.length > 0 && { filePaths }),
      });

      return res.status(200).json(task);
    } catch (error) {
      logger.error(`[UPDATE TASK ERROR]: ${error.message}`);

      return res
        .status(error.message === "Task not found" ? 404 : 500)
        .json({ error: error.message });
    }
  }
);

// Delete a task by ID
router.delete("/:id", async (req, res) => {
  try {
    await TaskService.deleteTask(req.params.id);

    return res.status(204).send(); // No Content
  } catch (error) {
    logger.error("[DELETE TASK ERROR]:", error.message);

    return res
      .status(error.message === "Task not found" ? 404 : 500)
      .json({ error: error.message });
  }
});

module.exports = router;
