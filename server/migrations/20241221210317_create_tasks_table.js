/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tasks", (table) => {
    table.increments("id").primary(); // Otomatik artan birincil anahtar
    table.string("title", 255).notNullable(); // Görev başlığı
    table.text("description").notNullable(); // Görev açıklaması
    table.enu("priority", ["low", "medium", "high"]).defaultTo("medium"); // Öncelik seviyesi
    table
      .enu("status", ["notStarted", "inProgress", "completed"])
      .defaultTo("notStarted"); // Görev durumu
    table.timestamp("endDate").nullable(); // Bitiş tarihi
    table.text("filePaths", 255).nullable();
    table.integer("q").notNullable();
    table
      .integer("createdBy")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Oluşturan kullanıcı
    table
      .integer("assignedTo")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL"); // Atanan kullanıcı
    table.timestamps(true, true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tasks");
};
