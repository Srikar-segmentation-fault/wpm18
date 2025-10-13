// app_server/controllers/auth.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { issueToken } = require("../utils/auth");

/* ---------- VIEWS ---------- */
function showLogin(req, res) {
  return res.render("auth/login", { title: "Login" });
}

function showRegister(req, res) {
  return res.render("auth/register", { title: "Sign up" });
}

/* ---------- ACTIONS ---------- */
async function login(req, res) {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
      return res
        .status(400)
        .render("auth/login", {
          title: "Login",
          error: "Email and password are required.",
        });
    }

    // Must be inside an async function — not top-level!
    const user = await User.findOne({ email }).select(
      "+passwordHash +role +name"
    );
    if (!user || !user.passwordHash) {
      return res
        .status(401)
        .render("auth/login", {
          title: "Login",
          error: "Invalid email or password.",
        });
    }

    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.passwordHash);
    } catch (e) {
      ok = false;
    }
    if (!ok) {
      return res
        .status(401)
        .render("auth/login", {
          title: "Login",
          error: "Invalid email or password.",
        });
    }

    const token = issueToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect("/properties");
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .render("error", {
        title: "Error",
        message: "Login failed. Please try again.",
      });
  }
}

async function register(req, res) {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();
    const role = (req.body.role || "seeker").trim();

    if (!name || !email || !password) {
      return res
        .status(400)
        .render("auth/register", {
          title: "Sign up",
          error: "All fields are required.",
        });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .render("auth/register", {
          title: "Sign up",
          error: "Email already in use.",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, role, passwordHash });

    const token = issueToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect("/properties");
  } catch (err) {
    console.error("Register error:", err);
    return res
      .status(500)
      .render("error", {
        title: "Error",
        message: "Registration failed. Please try again.",
      });
  }
}

function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  return res.redirect("/");
}

/* ---------- EXPORTS ---------- */
module.exports = {
  showLogin,
  showRegister,
  login,
  register,
  logout,
};
