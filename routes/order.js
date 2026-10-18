const express = require("express");
const orderRouter = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const isAuth = require("../middleware/passport");
const isAdmin = require("../middleware/isAdmin");

// Rend le stock en cas d'annulation ou d'échec
const restoreStock = (items) =>
  Promise.all(
    items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } }))
  );

// POST /order  — body: { shippingAddress, paymentMethod }  (les articles viennent du panier)
// Le prix est TOUJOURS pris depuis la base, jamais depuis le client.
orderRouter.post("/", isAuth(), async (req, res) => {
  const reserved = [];
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // populate => les produits supprimés de la DB deviennent null et sont ignorés
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "_id");
    const items = cart ? cart.items.filter((i) => i.product) : [];
    if (items.length === 0) {
      return res.status(400).send({ msg: "Cart is empty" });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = item.product._id;
      const quantity = item.quantity;
      const qty = parseInt(quantity);
      if (!qty || qty < 1) throw { status: 400, msg: "Invalid quantity" };

      // décrément atomique : ne marche que si le stock suffit
      // isActive: { $ne: false } => les anciens produits sans le champ passent aussi
      const p = await Product.findOneAndUpdate(
        { _id: product, isActive: { $ne: false }, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!p) {
        // on cherche la vraie raison pour donner un message précis
        const check = await Product.findById(product);
        if (!check) throw { status: 404, msg: "Product not found" };
        if (check.isActive === false) throw { status: 400, msg: `${check.name} is not available` };
        if (check.stock <= 0) throw { status: 400, msg: `${check.name} is out of stock` };
        throw { status: 400, msg: `Only ${check.stock} left for ${check.name}` };
      }

      reserved.push({ product: p._id, quantity: qty });
      orderItems.push({
        product: p._id,
        name: p.name,
        price: p.price,
        image: p.images?.[0],
        quantity: qty,
      });
      totalPrice += p.price * qty;
    }

    const order = await new Order({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod,
    }).save();

    // commande validée => on vide le panier
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });

    res.status(201).send({ order, msg: "Order created" });
  } catch (error) {
    await restoreStock(reserved);
    if (error.status) return res.status(error.status).send({ msg: error.msg });
    console.error(error);
    res.status(500).send({ msg: "Error creating order", error: error.message });
  }
});

// GET /order/my  — historique du client connecté
orderRouter.get("/my", isAuth(), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.send({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching orders" });
  }
});

// GET /order  — toutes les commandes (admin)
orderRouter.get("/", isAuth(), isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullname email")
      .sort({ createdAt: -1 });
    res.send({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching orders" });
  }
});

// GET /order/:id  — le propriétaire ou l'admin
orderRouter.get("/:id", isAuth(), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "fullname email");
    if (!order) return res.status(404).send({ msg: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).send({ msg: "Forbidden" });
    }
    res.send({ order });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching order" });
  }
});

// PUT /order/:id/status  — admin: confirmed / shipped / delivered / cancelled
orderRouter.put("/:id/status", isAuth(), isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).send({ msg: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ msg: "Order not found" });
    if (order.status === "cancelled") {
      return res.status(400).send({ msg: "Order already cancelled" });
    }

    if (status === "cancelled") await restoreStock(order.items);

    order.status = status;
    await order.save();
    res.send({ order, msg: "Status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error updating status" });
  }
});

// PUT /order/:id/cancel  — le client annule tant que c'est "pending"
orderRouter.put("/:id/cancel", isAuth(), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).send({ msg: "Order not found" });
    if (order.status !== "pending") {
      return res.status(400).send({ msg: "Only pending orders can be cancelled" });
    }

    await restoreStock(order.items);
    order.status = "cancelled";
    await order.save();
    res.send({ order, msg: "Order cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error cancelling order" });
  }
});

module.exports = orderRouter;