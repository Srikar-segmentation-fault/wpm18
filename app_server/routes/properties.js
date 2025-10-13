const express = require("express");
const { requireAuth } = require("../utils/auth");
const {
  listAll,
  details,
  createForm,
  create,
  ownerDashboard,
} = require("../controllers/properties");
const { requestBooking, updateStatus } = require("../controllers/bookings");

const router = express.Router();

// 🔒 require login to see listings and details
router.get("/", requireAuth(), listAll);
router.get("/:id", requireAuth(), details);

// Owner-only routes (already protected)
router.get("/owner/new", requireAuth(["owner"]), createForm);
router.post("/owner/new", requireAuth(["owner"]), create);
router.get("/owner/dashboard", requireAuth(["owner"]), ownerDashboard);

// Booking actions
router.post("/:id/book", requireAuth(["seeker", "owner"]), requestBooking);
router.post("/booking/:bookingId/status", requireAuth(["owner"]), updateStatus);

module.exports = router;
