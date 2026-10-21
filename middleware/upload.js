const multer = require("multer");

const OK = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// les fichiers restent en mémoire, puis routes/upload.js les envoie vers Cloudinary
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5 Mo par image, 6 images max
  fileFilter: (req, file, cb) =>
    OK.includes(file.mimetype) ? cb(null, true) : cb(new Error("Format non supporté (JPG, PNG, WEBP ou GIF)")),
});