const { body, validationResult } = require("express-validator");

const registerRules = () => [
  body("fullname", "Full name is required").notEmpty().trim(),
  body("email", "Email is not valid").isEmail(),
  body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  body("phone", "Phone is not valid").optional().isMobilePhone("any"),
];

const loginRules = () => [
  body("email", "Email is not valid").isEmail(),
  body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
];

const validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array().map((e) => ({ msg: e.msg })) });
  }
  next();
};

module.exports = { registerRules, loginRules, validation };
