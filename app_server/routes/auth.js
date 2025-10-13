const express = require("express");
const {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  logout,
} = require("../controllers/auth");
const router = express.Router();
router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.post("/logout", logout);
module.exports = router;
