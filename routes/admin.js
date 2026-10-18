const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginRules, validation } = require("../middleware/validator");
const isAuth = require("../middleware/passport");
const isAdmin = require("../middleware/isAdmin");

const signToken = (admin) =>
  jwt.sign(
    { _id: admin._id, name: admin.fullname, role: admin.role },
    process.env.SecretOrKey,
    { expiresIn: "1h" }
  );

router.post("/login", loginRules(), validation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const found = await Admin.findOne({ email });
    if (!found || !(await bcrypt.compare(password, found.password))) {
      return res.status(400).send({ msg: "Bad credential" });
    }
    const admin = found.toObject();
    delete admin.password;

    res.status(200).send({ admin, msg: "success", token: `Bearer ${signToken(found)}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Cannot get the admin" });
  }
});

router.get("/current", isAuth(), isAdmin, (req, res) => {
  res.status(200).send({ user: req.user });
});

// USERS (clients)
router.get("/users", isAuth(), isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).send({ users });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la récupération des utilisateurs" });
  }
});

router.delete("/users/:id", isAuth(), isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ msg: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la suppression" });
  }
});

// DASHBOARD
router.get("/stats", isAuth(), isAdmin, async (req, res) => {
  try {
    const [users, products, orders, revenue, lowStock] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Product.find({ stock: { $lte: 3 } }).select("name stock"),
    ]);
    res.send({ users, products, orders, revenue: revenue[0]?.total || 0, lowStock });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error fetching stats" });
  }
});

module.exports = router;
