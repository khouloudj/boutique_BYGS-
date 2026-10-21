const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const upload = require("../middleware/upload");
const isAuth = require("../middleware/passport");
const isAdmin = require("../middleware/isAdmin");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// envoie un fichier (buffer) vers Cloudinary et renvoie son lien https
const toCloud = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bijoux", resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(file.buffer);
  });

// POST /upload  — champ "images" (jusqu'à 6 fichiers). Réservé à la vendeuse.
router.post("/", isAuth(), isAdmin, (req, res) => {
  upload.array("images", 6)(req, res, async (err) => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE" ? "Image trop lourde (5 Mo maximum)" : err.message;
      return res.status(400).send({ msg });
    }
    if (!req.files?.length) return res.status(400).send({ msg: "Aucune image reçue" });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).send({ msg: "Cloudinary n'est pas configuré (variables CLOUDINARY_* manquantes)" });
    }
    try {
      const urls = await Promise.all(req.files.map(toCloud));
      res.send({ urls });
    } catch (e) {
      console.error(e);
      res.status(500).send({ msg: "Échec de l'envoi de l'image vers Cloudinary" });
    }
  });
});

module.exports = router;