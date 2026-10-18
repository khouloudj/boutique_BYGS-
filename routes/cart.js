const express = require("express");
const cartRouter = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const isAuth = require("../middleware/passport");

const getCart = (userId) =>
  Cart.findOne({ user: userId }).populate("items.product", "name price images stock isActive");

// GET /cart
cartRouter.get("/", isAuth(), async (req, res) => {
  try {
    const cart = await getCart(req.user._id);
    const items = cart ? cart.items.filter((i) => i.product) : [];
    const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    res.send({ items, total });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching cart" });
  }
});

// POST /cart/add  — body: { product, quantity }
cartRouter.post("/add", isAuth(), async (req, res) => {
  try {
    const { product } = req.body;
    const quantity = parseInt(req.body.quantity) || 1;
    if (quantity < 1) return res.status(400).send({ msg: "Invalid quantity" });

    const p = await Product.findOne({ _id: product, isActive: true });
    if (!p) return res.status(404).send({ msg: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === product);
    const newQty = (existing ? existing.quantity : 0) + quantity;
    if (newQty > p.stock) return res.status(400).send({ msg: `Only ${p.stock} in stock` });

    if (existing) existing.quantity = newQty;
    else cart.items.push({ product, quantity });

    await cart.save();
    res.status(200).send({ msg: "Added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error adding to cart" });
  }
});

// PUT /cart/item/:productId  — body: { quantity }
cartRouter.put("/item/:productId", isAuth(), async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (!quantity || quantity < 1) return res.status(400).send({ msg: "Invalid quantity" });

    const p = await Product.findById(req.params.productId);
    if (!p) return res.status(404).send({ msg: "Product not found" });
    if (quantity > p.stock) return res.status(400).send({ msg: `Only ${p.stock} in stock` });

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id, "items.product": req.params.productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );
    if (!cart) return res.status(404).send({ msg: "Item not in cart" });
    res.send({ msg: "Quantity updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error updating cart" });
  }
});

// DELETE /cart/item/:productId
cartRouter.delete("/item/:productId", isAuth(), async (req, res) => {
  try {
    await Cart.updateOne(
      { user: req.user._id },
      { $pull: { items: { product: req.params.productId } } }
    );
    res.send({ msg: "Item removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error removing item" });
  }
});

// DELETE /cart  — vider le panier
cartRouter.delete("/", isAuth(), async (req, res) => {
  try {
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    res.send({ msg: "Cart cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error clearing cart" });
  }
});

module.exports = cartRouter;
