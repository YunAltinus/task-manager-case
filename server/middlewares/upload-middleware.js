const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

// Klasör yolları
const tempFolder = path.resolve("uploads/temp");
const finalFolder = path.resolve("uploads/compressed");
// Multer storage ayarları
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(tempFolder, { recursive: true }); // Geçici klasörü oluştur
      cb(null, tempFolder); // Geçici yükleme
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// Dosya tipi filtresi
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/png",
    "video/mp4",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, MP4, and PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Çoklu dosya sıkıştırma işlemi
const compressImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    await fs.mkdir(finalFolder, { recursive: true }); // Sıkıştırılmış dosya klasörünü oluştur

    for (const file of req.files) {
      // Yalnızca görüntü dosyalarını sıkıştır
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp"
      ) {
        const compressedFilePath = path.join(
          finalFolder,
          `compressed-${file.filename}`
        );

        await sharp(file.path)
          .resize(800) // Boyutlandırma
          .jpeg({ quality: 80 }) // Kalite ayarı
          .toFile(compressedFilePath);

        // Orijinal dosyayı sil
        await fs.unlink(file.path);

        // Yeni dosya bilgilerini güncelle
        file.path = compressedFilePath;
        file.filename = `compressed-${file.filename}`;
      } else {
        console.log(
          `[SKIP]: ${file.filename} bir görüntü dosyası değil, sıkıştırma yapılmadı.`
        );
      }
    }

    next();
  } catch (error) {
    console.error("[IMAGE COMPRESSION ERROR]:", error.message);
    res.status(500).json({ error: "Image compression failed" });
  }
};

module.exports = { upload, compressImages };
