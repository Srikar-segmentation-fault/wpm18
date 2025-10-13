const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const { issueToken } = require("../utils/auth");

exports.getRegister = (req, res) =>
  res.render("auth/register", { title: "Sign up" });
exports.getLogin = (req, res) => res.render("auth/login", { title: "Login" });

exports.postRegister = [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .render("auth/register", { title: "Sign up", errors: errors.array() });
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res
        .status(400)
        .render("auth/register", {
          title: "Sign up",
          errors: [{ msg: "Email already used" }],
        });
    const user = await User.create({ name, email, password, role });
    res.cookie("token", issueToken(user), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  },
];

exports.postLogin = [
  body("email").isEmail(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .render("auth/login", { title: "Login", errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.compare(password)))
      return res
        .status(400)
        .render("auth/login", {
          title: "Login",
          errors: [{ msg: "Invalid credentials" }],
        });
    res.cookie("token", issueToken(user), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  },
];

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};
