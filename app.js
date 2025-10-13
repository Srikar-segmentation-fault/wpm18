// app.js
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ---- DB ----
require("./app_server/models/db");

// ---- Routes ----
const indexRoutes = require("./app_server/routes/index");
const authRoutes = require("./app_server/routes/auth");
const propertyRoutes = require("./app_server/routes/properties");
const profileRoutes = require("./app_server/routes/profile");

// ---- App ----
const app = express();
app.set("views", path.join(__dirname, "app_server", "views"));
app.set("view engine", "pug");

// Static + parsers
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

// ---- Auth context: make user available everywhere ----
app.use((req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
      req.user = decoded; // controllers can read
      res.locals.user = decoded; // pug templates can read
    } else {
      req.user = null;
      res.locals.user = null;
    }
  } catch (err) {
    req.user = null;
    res.locals.user = null;
  }
  next();
});

// ---- Mount routes ----
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/profile", profileRoutes);

// Helpful shortcuts (optional)
app.get("/login", (req, res) => res.redirect("/auth/login"));
app.get("/register", (req, res) => res.redirect("/auth/register"));
app.get("/dashboard", (req, res) =>
  res.redirect("/properties/owner/dashboard")
);

// ---- 404 ----
app.use((req, res) => {
  res
    .status(404)
    .render("error", { title: "Not Found", message: "Page not found" });
});

module.exports = app;
