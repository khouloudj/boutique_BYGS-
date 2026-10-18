const express = require("express");
const User = require("../models/User");
const Admin = require("../models/Admin");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginRules, registerRules, validation } = require("../middleware/validator");
const isAuth = require("../middleware/passport");

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, fullname: user.fullname, role: user.role },
    process.env.SecretOrKey,
    { expiresIn: "1h" }
  );

const safe = (user) => {
  const u = user.toObject();
  delete u.password;
  return u;
};

// POST /user/register  — création de compte CLIENT uniquement
router.post("/register", registerRules(), validation, async (req, res) => {
  const { fullname, email, password, phone, address } = req.body;
  try {
    // l'email ne doit exister ni chez les clients, ni chez le vendeur
    if ((await User.findOne({ email })) || (await Admin.findOne({ email }))) {
      return res.status(400).send({ msg: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    // le role n'est JAMAIS lu depuis req.body : il est toujours "user" (défaut du model)
    const saved = await new User({ fullname, email, password: hashedPassword, phone, address }).save();

    res.status(201).send({ user: safe(saved), msg: "User is saved", token: `Bearer ${signToken(saved)}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error while registering user" });
  }
});

// POST /user/login
router.post("/login", loginRules(), validation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const found = await User.findOne({ email });
    if (!found || !(await bcrypt.compare(password, found.password))) {
      return res.status(400).send({ msg: "Bad credential" });
    }
    res.status(200).send({ user: safe(found), msg: "success", token: `Bearer ${signToken(found)}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Cannot get the user" });
  }
});

// GET /user/current
router.get("/current", isAuth(), (req, res) => {
  res.status(200).send({ user: req.user });
});

// PUT /user/profile  — modifier nom / téléphone / adresse
router.put("/profile", isAuth(), async (req, res) => {
  const { fullname, phone, address } = req.body;
  try {
    const data = { fullname, phone, address };
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    const updated = await User.findByIdAndUpdate(req.user._id, { $set: data }, { new: true, runValidators: true }).select("-password");
    if (!updated) return res.status(404).send({ msg: "User not found" });
    res.status(200).send({ user: updated, msg: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error while updating profile" });
  }
});

module.exports = router;