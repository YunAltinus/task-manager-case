const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "0.0.0.0",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "test",
  },
  pool: { min: 2, max: 10 }, // Bağlantı havuzu ayarları
});

module.exports = db;
