const db = require("../../loaders/mysql-connection");
const logger = require("../../utils/logger");

class TaskModel {
  constructor(data) {
    Object.assign(this, data);

    // JSON olarak saklanan filePaths'i parse et
    if (this.filePaths) {
      this.filePaths = JSON.parse(this.filePaths);
    }

    this.createdBy = this.createdBy
      ? {
          id: this.createdBy,
          username: this.createdByUsername,
        }
      : null;

    this.assignedTo = this.assignedTo
      ? {
          id: this.assignedTo,
          username: this.assignedToUsername,
        }
      : null;

    delete this.createdByUsername;
    delete this.assignedToUsername;
  }

  static baseQuery() {
    return db("tasks")
      .select(
        "tasks.*",
        "creator.username as createdByUsername",
        "assignee.username as assignedToUsername"
      )
      .leftJoin("users as creator", "tasks.createdBy", "creator.id")
      .leftJoin("users as assignee", "tasks.assignedTo", "assignee.id");
  }

  static async findById(id) {
    const result = await this.baseQuery().where("tasks.id", id).first();
    return result ? new TaskModel(result) : null;
  }

  static async findAll(filters = {}) {
    let query = this.baseQuery();

    // Filtreleme
    if (filters.status) query = query.where("tasks.status", filters.status);
    if (filters.priority)
      query = query.where("tasks.priority", filters.priority);
    if (filters.endDate)
      query = query.where("tasks.endDate", "<=", new Date(filters.endDate));
    if (filters.hasAttachment) {
      const hasAttachment = filters.hasAttachment === "true"; // String'i boolean yap
      query = query.whereNotNull("tasks.assignedTo");
    }

    // Sıralama
    if (filters.orderBy) {
      const direction = filters.orderBy === "desc" ? "desc" : "asc"; // Varsayılan `asc`
      query = query.orderBy(`createdAt`, direction);
    }

    const results = await query;

    return results.map((result) => new TaskModel(result));
  }

  static async create(data) {
    if (data.filePaths && Array.isArray(data.filePaths)) {
      data.filePaths = JSON.stringify(data.filePaths);
    }

    const [insertedId] = await db("tasks").insert(data);

    logger.info(`[TASK CREATED]: ${insertedId}`);

    return await this.findById(insertedId);
  }

  async save() {
    const updateData = { ...this };

    if (Array.isArray(this.filePaths)) {
      updateData.filePaths = JSON.stringify(this.filePaths); // JSON string olarak kaydet
    }

    updateData.createdBy = this.createdBy?.id || this.createdBy;
    updateData.assignedTo = this.assignedTo?.id || this.assignedTo;
    delete updateData.id;

    await db("tasks").where("id", this.id).update(updateData);
  }

  static async delete(id) {
    const result = await db("tasks").where("id", id).del();
    return result > 0;
  }
}

module.exports = TaskModel;
