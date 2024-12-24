const { createLogger, format, transports } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  level: "info", // Log seviyesini belirler (info, error, warn, debug)
  format: format.combine(
    format.timestamp(),
    format.json() // Logları JSON formatında saklar
  ),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      level: "info", // MongoDB'ye kaydedilecek minimum log seviyesi
      db: process.env.MONGO_URI || "mongodb://mongo:27017/logs", // MongoDB bağlantısı
      collection: "appLogs", 
    }),
  ],
});

module.exports = logger;
