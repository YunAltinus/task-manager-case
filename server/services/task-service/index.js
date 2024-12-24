const TaskModel = require("./task-model");
const { taskQueue, calculateDelay } = require("../../queues/task-queue");
const fs = require("fs").promises;
const redisClient = require("../../loaders/redis-connection");
const logger = require("../../utils/logger");

class TaskService {
  async insertTask(data) {
    const task = await TaskModel.create(data);

    await taskQueue.add(
      {
        id: task.id,
        title: task.title,
        deadline: calculateDelay(task.endDate),
      },
      { delay: calculateDelay(task.endDate) }
    );

    await redisClient.delete(`tasksCache:*`);

    return task;
  }

  async fetchTasks(filters) {
    const cacheKey = `tasksCache:${JSON.stringify(filters)}`;

    // Redis'ten önbelleği kontrol et
    const cachedTasks = await redisClient.get(cacheKey);
    if (cachedTasks) {
      logger.info("[REDIS CACHE]: Tasks fetched from cache");
      return JSON.parse(cachedTasks);
    }

    const tasks = await TaskModel.findAll(filters);

    await redisClient.set(cacheKey, JSON.stringify(tasks), {
      EX: 60 * 5, // 5 dakika
    });

    logger.info("[REDIS CACHE]: Tasks cached");
    return tasks;
  }

  async fetchTaskById(id) {
    const task = await TaskModel.findById(id);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async updateTask(id, data) {
    const task = await TaskModel.findById(id);
    if (!task) throw new Error("Task not found");

    if (data.filePaths) {
      task.filePaths = data.filePaths; // Dosya yollarını güncelleme
    }

    Object.assign(task, data);

    await redisClient.delete(`tasksCache:*`);

    await task.save();
    logger.info(`[UPDATE TASK]: ${data}`);
    return task;
  }

  async deleteTask(id) {
    const task = await TaskModel.findById(id);

    if (!task) {
      throw new Error("Task not found");
    }
    await redisClient.delete(`tasksCache:*`);
    // Dosyaları sil
    if (task.filePaths && Array.isArray(task.filePaths)) {
      for (const filePath of task.filePaths) {
        try {
          await fs.unlink(filePath);
          logger.log(`[FILE DELETED]: ${filePath}`);
        } catch (error) {
          logger.error(
            `[FILE DELETE ERROR]: Could not delete ${filePath} : ${error.message}
            `
          );
        }
      }
    }

    // Görevi sil
    const result = await TaskModel.delete(id);
    if (!result) {
      throw new Error("Task deletion failed");
    }

    logger.info(`[TASK DELETED]: ID ${id}`);
    return true;
  }

  async changeTaskState(id, newState) {
    const task = await TaskModel.findById(id);
    if (!task) throw new Error("Task not found");

    task.status = newState;
    await task.save();
    return task;
  }
}

module.exports = new TaskService();
