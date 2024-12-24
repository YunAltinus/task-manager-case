const redis = require("redis");
require("dotenv").config();

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
      password: process.env.REDIS_PASSWORD,
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Connected to Redis");
    } catch (err) {
      console.error("Redis connection error:", err);
      throw err; // Hatanın yukarıya iletilmesi
    }
  }

  async set(key, value, expirationInSeconds = 0) {
    if (expirationInSeconds > 0) {
      await this.client.setEx(key, expirationInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key) {
    return await this.client.get(key);
  }

  async delete(pattern) {
    try {
      const stream = this.client.scanIterator({
        MATCH: pattern,
        COUNT: 100, // Her seferinde 100 anahtarı tarar
      });

      let deletedCount = 0;
      for await (const key of stream) {
        await this.client.del(key);
        deletedCount++;
      }

      console.log(`[REDIS DELETE]: ${deletedCount} key(s) deleted`);
    } catch (error) {
      console.error("[REDIS DELETE ERROR]:", error.message);
    }
  }

  async quit() {
    await this.client.quit();
    console.log("Redis connection closed");
  }
}

module.exports = new RedisClient();
