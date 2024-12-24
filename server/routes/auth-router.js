const express = require("express");
const AuthService = require("../services/auth-service");
const { authenticateToken } = require("../middlewares/auth-middleware");
const logger = require("../utils/logger");

const router = express.Router();

// Kullanıcı kayıt
router.post("/register", async (req, res) => {
  try {
    const user = await AuthService.register(req.body);

    return res.status(201).json(user);
  } catch (error) {
    logger.error(`[REGISTER ERROR]: ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
});

// Kullanıcı giriş
router.post("/login", async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await AuthService.login(
      req.body
    );

    return res.status(200).json({ accessToken, refreshToken, user });
  } catch (error) {
    logger.error(`[LOGIN ERROR]: ${error.message}`);

    return res.status(401).json({ error: error.message });
  }
});

// Token yenileme
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const { accessToken } = await AuthService.refreshToken(refreshToken);

    return res.status(200).json({ accessToken });
  } catch (error) {
    logger.error("[REFRESH TOKEN ERROR]:", error.message);

    return res.status(403).json({ error: error.message });
  }
});

// Kullanıcı çıkış
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    await AuthService.logout(req.user.id);

    return res.status(204).send(); // No Content
  } catch (error) {
    logger.error("[LOGOUT ERROR]:", error.message);

    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
