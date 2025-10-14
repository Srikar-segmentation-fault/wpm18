// app_server/routes/properties.js
const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/properties");
const { requireAuth } = require("../utils/auth");

// ✅ Multer upload (local disk) — make sure this file exists
// at app_server/middleware/upload.js and exports { uploadListingImages }
const { uploadListingImages } = require("../middleware/upload");

/**
 * Small helper to trap Multer errors and respond nicely
 * instead of taking down the whole request pipeline.
 */
const handleMulter = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (!err) return next();
    // Known Multer limits
    if (
      err.code === "LIMIT_FILE_SIZE" ||
      err.code === "LIMIT_FILE_COUNT" ||
      err.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({ ok: false, error: err.message });
    }
    // Custom fileFilter errors or others
    return res
      .status(400)
      .json({ ok: false, error: err.message || "Upload error" });
  });
};

// ---------- PUBLIC ----------
router.get("/", ctrl.listAll);

// ---------- OWNER / AUTH REQUIRED ----------
// Put specific routes BEFORE any `/:id` param route to avoid conflicts
router.get("/owner/dashboard", requireAuth(["owner"]), ctrl.ownerDashboard);

// NEW LISTING (aliases)
router.get("/new", requireAuth(["owner"]), ctrl.createForm);
router.get("/owner/new", requireAuth(["owner"]), ctrl.createForm);

// CREATE listing (expects field name 'images')
router.post(
  "/create",
  requireAuth(["owner"]),
  handleMulter(uploadListingImages.array("images", 8)),
  ctrl.create
);

// ADD images to an existing listing
router.post(
  "/:id/images",
  requireAuth(["owner"]),
  handleMulter(uploadListingImages.array("images", 8)),
  ctrl.addImages
);

// DELETE one image (optional if implemented)
// (No Multer here because no files are uploaded on delete)
router.post(
  "/:id/images/:filename/delete",
  requireAuth(["owner"]),
  ctrl.deleteImage
);

// ---------- PUBLIC (PARAM) ----------
// Keep this LAST so it doesn't swallow routes like /owner/dashboard
router.get("/:id", ctrl.details);

module.exports = router;
