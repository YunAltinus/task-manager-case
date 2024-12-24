const express = require("express");
const path = require("path");
const logger = require("morgan");
const helmet = require("helmet");
const dontev = require("dotenv");
const sanitizer = require("perfect-express-sanitizer");
const { rateLimit } = require("express-rate-limit");
const cors = require("cors");

dontev.config();
require("./loaders/mysql-connection");
require("./loaders/redis-connection");

const tasksRouter = require("./routes/task-router");
const authRouter = require("./routes/auth-router");
const userRouter = require("./routes/user-router");

const app = express();

// Initialize loaders
// logger middleware
app.use(logger("dev"));

// cors middleware
app.use(cors());

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const staticPath = path.join(__dirname, "uploads");
console.log("Static Path: ", staticPath); // Doğru yolu yazdırır
app.use("/uploads", express.static(staticPath));

app.use("/api", authRouter);
app.use("/api/users", userRouter);
app.use("/api/tasks", tasksRouter);

// Statik dosya servisi için endpoint
app.get("/files/:filename", (req, res) => {
  const filename = req.params.filename; // URL'den dosya adını al
  const filePath = path.join(__dirname, "../uploads/compressed", filename); // Dosya yolu

  // Dosyanın var olup olmadığını kontrol et
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }

    // Dosya türüne göre döndür
    const ext = path.extname(filename).toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      res.type("image/jpeg").sendFile(filePath); // Resim
    } else if (ext === ".mp4") {
      res.type("video/mp4").sendFile(filePath); // Video
    } else if (ext === ".pdf") {
      res.type("application/pdf").sendFile(filePath); // PDF
    } else {
      res.status(415).json({ error: "Unsupported file type" }); // Desteklenmeyen dosya
    }
  });
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  })
);

// app.use(
//   sanitizer.clean({
//     xss: true,
//     noSql: true,
//     sql: true,
//     level: 5,
//   })
// );

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
});

module.exports = app;
