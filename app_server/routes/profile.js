const express = require("express");
const { requireAuth } = require("../utils/auth");
const { viewProfile, editProfile } = require("../controllers/profile");
const router = express.Router();
router.get("/", requireAuth(), viewProfile);
router.post("/", requireAuth(), editProfile);
module.exports = router;
