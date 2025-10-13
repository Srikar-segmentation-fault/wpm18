// app_server/routes/auth.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth");
const { requireGuest /*, requireAuth */ } = require("../utils/auth");

// -------- Views (only for guests) --------
router.get("/login", requireGuest(), auth.showLogin);
router.get("/register", requireGuest(), auth.showRegister);

// -------- Actions --------
router.post("/login", auth.login);
router.post("/register", auth.register);

// Logout (POST preferred; GET added for convenience in demos)
router.post("/logout", auth.logout);
router.get("/logout", auth.logout);

module.exports = router;
