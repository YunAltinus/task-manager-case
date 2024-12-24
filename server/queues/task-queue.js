const Queue = require("bull");
require("dotenv").config();

const taskQueue = new Queue("taskQueue", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
  },
});

// Delay hesaplama fonksiyonu
const calculateDelay = (deadline) => {
  const deadlineMs = new Date(deadline).getTime();
  const nowMs = Date.now();
  return Math.max(deadlineMs - nowMs - 24 * 60 * 60 * 1000, 0); // 1 gün öncesi
};

module.exports = { taskQueue, calculateDelay };
