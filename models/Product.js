const mongoose = require("mongoose");

const CATS = ["bijoux-accessoires", "sacs", "laine", "bebe", "mariage", "deco", "autres"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    // emplacement principal (= le premier de "placements"), gardé pour compatibilité
    category: { type: String, required: true, enum: CATS },
    subcategory: { type: String, default: "", trim: true },
    // tous les emplacements : un produit peut apparaître dans plusieurs catégories / sous-catégories
    placements: [
      {
        _id: false,
        category: { type: String, required: true, enum: CATS },
        subcategory: { type: String, default: "", trim: true },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [String],
    model: { type: String, default: "" }, // lien du modèle 3D (.glb), optionnel
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);