const express = require("express");
const UserModel = require("../services/auth-service/user-model");
const { authenticateToken } = require("../middlewares/auth-middleware");
const logger = require("../utils/logger");

const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();

    return res.status(200).json(users);
  } catch (error) {
    logger.error(`[FETCH USERS ERROR]: ${error.message}`);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching users" });
  }
});

module.exports = router;
