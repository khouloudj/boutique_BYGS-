// Utilisation (une seule fois) :
//   ADMIN_NAME="Nom" ADMIN_EMAIL="vendeur@mail.com" ADMIN_PASSWORD="motdepasse" node scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

(async () => {
  try {
    // adapte le nom de la variable à celui utilisé dans config/db_Connect.js
    await mongoose.connect(process.env.MONGO_URI);

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD requis");

    if (await Admin.findOne({ email: ADMIN_EMAIL })) {
      console.log("Admin déjà existant");
    } else {
      const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await new Admin({ fullname: ADMIN_NAME || "Admin", email: ADMIN_EMAIL, password }).save();
      console.log("Admin créé ✔");
    }
  } catch (e) {
    console.error(e.message);
  } finally {
    await mongoose.disconnect();
  }
})();
