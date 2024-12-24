const jwt = require("jsonwebtoken");

/**
 * Auth middleware
 * @param {*} req - İstek
 * @param {*} res - Yanıt
 * @param {*} next - Bir sonraki middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY); 
    
    if (!token || !user) {
      return res.status(401).json({ error: "Access denied, token missing" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[JWT ERROR]:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    req.user = user;
    next();
  } catch (err) {
    console.error("[REFRESH TOKEN ERROR]:", err.message);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

module.exports = { authenticateToken, authenticateRefreshToken };
