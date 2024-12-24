require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "0.0.0.0" || "mysql",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "test",
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations", // Migration tabloları için
    },
    pool: { min: 2, max: 10 },
  },
};
