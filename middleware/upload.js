const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const dir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(dir, { recursive: true });

const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

module.exports = multer({
  storage: multer.diskStorage({
    destination: dir,
    // l'extension vient du type réel du fichier, jamais du nom envoyé par l'utilisateur
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5 Mo par image, 6 images max
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(new Error("Format non supporté (JPG, PNG, WEBP ou GIF)")),
});
