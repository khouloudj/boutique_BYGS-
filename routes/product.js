const express = require("express");
const productRouter = express.Router();
const Product = require("../models/Product");
const isAuth = require("../middleware/passport");
const isAdmin = require("../middleware/isAdmin");

const pick = (b) => {
  const { name, description, category, subcategory, placements, price, stock, images, model, featured, isActive } = b;
  const data = { name, description, category, subcategory, placements, price, stock, images, model, featured, isActive };
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return data;
};

// nettoie les emplacements et synchronise category/subcategory avec le premier
const clean = (b) => {
  const data = pick(b);
  if (Array.isArray(data.placements)) {
    data.placements = data.placements.filter((x) => x && x.category);
    if (data.placements.length) {
      data.category = data.placements[0].category;
      data.subcategory = data.placements[0].subcategory || "";
    }
  }
  return data;
};

// GET /product?category=bijoux&search=bague&minPrice=10&maxPrice=100&page=1&limit=12
productRouter.get("/", async (req, res) => {
  try {
    const { category, subcategory, search, minPrice, maxPrice, featured } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const filter = { isActive: { $ne: false } };
    if (category || subcategory) {
      const c = {};
      if (category) c.category = category;
      if (subcategory) c.subcategory = subcategory;
      // emplacement principal OU l'un des autres emplacements (même couple catégorie/sous-catégorie)
      filter.$or = [c, { placements: { $elemMatch: c } }];
    }
    if (featured === "true") filter.featured = true;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.send({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching products" });
  }
});

// GET /product/:id
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ msg: "Product not found" });
    res.send({ product });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching product" });
  }
});

// ADMIN ONLY
productRouter.post("/", isAuth(), isAdmin, async (req, res) => {
  try {
    const product = await new Product(clean(req.body)).save();
    res.status(201).send({ product, msg: "Product created" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error creating product", error: error.message });
  }
});

productRouter.put("/:id", isAuth(), isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: clean(req.body) },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).send({ msg: "Product not found" });
    res.send({ product, msg: "Product updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error updating product" });
  }
});

productRouter.delete("/:id", isAuth(), isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send({ msg: "Product not found" });
    res.send({ msg: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error deleting product" });
  }
});

module.exports = productRouter;