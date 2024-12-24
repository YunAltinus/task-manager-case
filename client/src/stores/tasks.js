import { defineStore } from "pinia";
import axiosInstance from "@/utils/axiosInstance";

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    task: {
      title: "",
      description: "",
      priority: "low",
      status: "notStarted",
      endDate: null,
      hasAttachment: false,
      q: 0,
      files: [],
      assignedTo: null,
    },
    visibleEditTaskDialog: false,
    searchModel: {
      priority: null,
      status: null,
      endDate: null,
      hasAttachment: false,
    },
    tasks: [],
    notStartedTasks: [],
    completedTasks: [],
    users: [],
  }),
  getters: {
  },
  actions: {
    async fetchTasks() {
      const filter = this.getQueryParams();
      const response = await axiosInstance.get(`/tasks?${filter}`);
      this.setTasks(response.data);
    },

    setTasks(tasks) {
      this.tasks = tasks;
      this.notStartedTasks = tasks.filter((task) => task.status === "notStarted");
      this.completedTasks = tasks.filter((task) => task.status === "completed");
    },

    async createTask(taskData, isFormData = false) {
      try {
        const headers = isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" };

        const response = await axiosInstance.post("/tasks", taskData, {
          headers,
        });
        const newTask = response.data;
        this.tasks.push(newTask);
        this.notStartedTasks.push(newTask);

        this.resetTask();
        return newTask;
      } catch (error) {
        console.error("Görev oluşturma hatası:", error);
        throw error;
      }
    },

    async updateTask(task) {
      try {
        if (task.files && task.files.length > 0) {
          // Dosyalar varsa FormData kullan
          const formData = new FormData();
          formData.append("title", task.title);
          formData.append("description", task.description);
          formData.append("priority", task.priority);
          formData.append("status", task.status);
          if (task.endDate) {
            formData.append("endDate", new Date(task.endDate).toISOString());
          }

          // Dosyaları FormData'ya ekle
          task.files.forEach((file) => {
            formData.append("files", file);
          });

          return await axiosInstance.put(`/tasks/${task.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          // Dosyalar yoksa JSON formatında gönder
          return await axiosInstance.put(`/tasks/${task.id}`, task);
        }
      } catch (error) {
        console.error("Task update error:", error);
        throw error;
      }
    },

    async deleteTask(task) {
      try {
        const response = await axiosInstance.delete(`/tasks/${task.id}`);
        const deletedTask = (response.status === 204);
        this.fetchTasks();
        return deletedTask;
      } catch (error) {
        console.error("Task delete error:", error);
        throw error;
      }
    },

    async setAttachmentUser() {
      try {
        console.log('sa')
        const response = await axiosInstance.put(`/tasks/${this.task.id}`, { assignedTo: this.task.assignedTo });
        this.fetchTasks();
        return response.data;
      } catch (error) {
        console.error("Task attachment error:", error);
        throw error;
      }
    },

    getQueryParams() {
      const params = [];
      const { priority, status, endDate, hasAttachment } = this.searchModel;

      if (priority) params.push(`priority=${priority}`);
      if (status) params.push(`status=${status}`);
      if (endDate) {
        // const date = new Date(endDate);
        // const day = String(date.getDate()).padStart(2, "0");
        // const month = String(date.getMonth() + 1).padStart(2, "0");
        // const year = date.getFullYear();

        params.push(`endDate=${new Date(endDate).toISOString()}`);
      }
      if (hasAttachment) params.push(`hasAttachment=${hasAttachment}`);

      return params.join("&");
    },

    async goEditTask(task) {
      this.task = task;

      this.visibleEditTaskDialog = true;
      this.selectedTask = task;
    },
    searchReset() {
      this.searchModel = {
        priority: null,
        status: null,
        endDate: null,
        hasAttachment: false,
      };
    },
    resetTask() {
      this.task = {
        title: "",
        description: "",
        priority: "low",
        status: "notStarted",
        endDate: null,
        hasAttachment: false,
        q: 0,
        files: [],
        assignedTo: null,
      };
      this.visibleEditTaskDialog = false;
    },

    updateNotStartedTasks(newList) {
      this.tasks = this.tasks.map(task =>
        task.status === "notStarted" ? { ...task, ...newList.find(t => t.id === task.id) } : task
      );
    },

    updateCompletedTasks(newList) {
      this.tasks = this.tasks.map(task =>
        task.status === "completed" ? { ...task, ...newList.find(t => t.id === task.id) } : task
      );
    },

    async fetchUsers() {
      const response = await axiosInstance.get("/users");
      this.users = response.data;
    },
  },
});
