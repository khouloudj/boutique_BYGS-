// Une seule fois : convertit les anciens produits vers les nouvelles catégories
//   node scripts/migrateCategories.js
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const a = await Product.updateMany({ category: { $in: ["bijoux", "accessoires"] } }, { $set: { category: "bijoux-accessoires" } });
    const b = await Product.updateMany({ category: "sacs-perles" }, { $set: { category: "sacs", subcategory: "perles" } });
    const c = await Product.updateMany({ category: "sacs-laine" }, { $set: { category: "sacs", subcategory: "crochet" } });
    console.log(`Migration ✔  bijoux/accessoires: ${a.modifiedCount} · sacs perles: ${b.modifiedCount} · sacs laine: ${c.modifiedCount}`);
  } catch (e) { console.error(e.message); }
  finally { await mongoose.disconnect(); }
})();
