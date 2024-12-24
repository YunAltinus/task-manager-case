const UserModel = require("./user-model");
const jwt = require("jsonwebtoken");
const redisClient = require("../../loaders/redis-connection");
const logger = require("../../utils/logger");

class AuthService {
  async register(userData) {

    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email is already in use");
    }
    const user = await UserModel.create(userData);
    logger.info(`[USER REGISTERED]: ${user.email}`);
    return user;
  }

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Access ve Refresh Token Oluştur
    const accessToken = this.generateToken(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY,
      "1d"
    );

    const refreshToken = this.generateToken(
      { id: user.id, email: user.email },
      process.env.REFRESH_SECRET_KEY,
      "7d"
    );

    // Refresh Token'ı Redis'e Kaydet
    await this.saveRefreshToken(user.id, refreshToken);

    logger.info(`[USER LOGGED IN]: ${user.email}`);
    return { accessToken, refreshToken, user };
  }

  async validateToken(token) {
    try {
      const decoded = this.verifyToken(token, process.env.SECRET_KEY);
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw new Error("Invalid token");
      }
      return user;
    } catch (error) {
      logger.error(`[TOKEN VALIDATION ERROR]: ${error.message}`);
      throw new Error("Token validation failed");
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(
        refreshToken,
        process.env.REFRESH_SECRET_KEY
      );

      // Redis'ten Refresh Token Kontrolü
      const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error("Invalid or expired refresh token");
      }

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw new Error("Invalid refresh token");
      }

      // Yeni Access Token Oluştur
      const accessToken = this.generateToken(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        "1h"
      );

      return { accessToken };
    } catch (error) {
      logger.error(`[REFRESH TOKEN ERROR]: error.message`);

      throw new Error("Refresh token validation failed");
    }
  }

  async logout(userId) {
    try {
      // Kullanıcının Refresh Token'ını Redis'ten Sil
      await redisClient.delete(`refreshToken:${userId}`);
      logger.info(`[SUCCESS LOGOUT]: ${userId}`);
    } catch (error) {
      logger.error(`[LOGOUT ERROR]: ${error.message}`);
      throw new Error("Logout failed");
    }
  }

  // Yardımcı Fonksiyonlar
  generateToken(payload, secretKey, expiresIn) {
    return jwt.sign(payload, secretKey, { expiresIn });
  }

  verifyToken(token, secretKey) {
    return jwt.verify(token, secretKey);
  }

  async saveRefreshToken(userId, refreshToken) {
    try {
      await redisClient.set(
        `refreshToken:${userId}`,
        refreshToken,
        7 * 24 * 60 * 60 // 7 gün TTL
      );
    } catch (error) {
      logger.error(`[REDIS SET ERROR]: ${error.message}`);
      throw new Error("Failed to save refresh token");
    }
  }
}

module.exports = new AuthService();
