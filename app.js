// app.js
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// app.js (top)
require("./app_server/models/db"); // <-- make sure we connect to MongoDB before routes/controllers run

// ---- Routes ----
const indexRoutes = require("./app_server/routes/index");
const authRoutes = require("./app_server/routes/auth");
const propertyRoutes = require("./app_server/routes/properties");
const profileRoutes = require("./app_server/routes/profile");

// ---- App ----
const app = express();
app.set("views", path.join(__dirname, "app_server", "views"));
app.set("view engine", "pug");

// Trust proxy so secure cookies work behind Render/Heroku load balancers
app.set("trust proxy", 1);

// ---- Static + parsers ----
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Health check (useful for Render) ----
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// ---- Auth context: expose user to controllers & templates ----
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
  } catch (_err) {
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

// Helpful shortcuts
app.get("/login", (_req, res) => res.redirect("/auth/login"));
app.get("/register", (_req, res) => res.redirect("/auth/register"));
app.get("/dashboard", (_req, res) =>
  res.redirect("/properties/owner/dashboard")
);

// ---- Global error handler (prevents 502 from uncaught errors) ----
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(500).render("error", {
    title: "Server error",
    message: "Something went wrong.",
  });
});

// ---- 404 ----
app.use((req, res) => {
  res
    .status(404)
    .render("error", { title: "Not Found", message: "Page not found" });
});

module.exports = app;
