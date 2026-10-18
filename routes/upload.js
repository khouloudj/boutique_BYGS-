const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const isAuth = require("../middleware/passport");
const isAdmin = require("../middleware/isAdmin");

// POST /upload  — champ "images" (jusqu'à 6 fichiers). Réservé à la vendeuse.
router.post("/", isAuth(), isAdmin, (req, res) => {
  upload.array("images", 6)(req, res, (err) => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE" ? "Image trop lourde (5 Mo maximum)" : err.message;
      return res.status(400).send({ msg });
    }
    if (!req.files?.length) return res.status(400).send({ msg: "Aucune image reçue" });
    res.send({ urls: req.files.map((f) => `/uploads/${f.filename}`) });
  });
});

module.exports = router;
