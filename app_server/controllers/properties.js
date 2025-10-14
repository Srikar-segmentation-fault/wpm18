// app_server/controllers/properties.js
const path = require("path");
const fs = require("fs/promises");

const Property = require("../models/property");
const Booking = require("../models/booking"); // still used in ownerDashboard

// 🏠 List all properties (public)
exports.listAll = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.render("properties/list", {
      title: "Available PGs & Rooms",
      properties,
      user: req.user,
    });
  } catch (err) {
    console.error("Error fetching listings:", err);
    res
      .status(500)
      .render("error", { title: "Error", message: "Failed to load listings" });
  }
};

// 📄 Property details
exports.details = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!property) {
      return res
        .status(404)
        .render("error", { title: "Not found", message: "Listing not found" });
    }

    res.render("properties/details", {
      title: property.title,
      property,
      user: req.user,
    });
  } catch (err) {
    console.error("Details error:", err);
    res
      .status(500)
      .render("error", { title: "Error", message: "Failed to load details" });
  }
};

// 🧾 Owner dashboard
exports.ownerDashboard = async (req, res) => {
  try {
    const myProps = await Property.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    const allBookings = await Booking.find({})
      .populate("property requester", "title name email owner")
      .sort({ createdAt: -1 });

    const myBookings = allBookings.filter(
      (b) => b.property && String(b.property.owner) === String(req.user._id)
    );

    res.render("dashboard/owner", {
      title: "Owner Dashboard",
      props: myProps,
      bookings: myBookings,
      user: req.user,
    });
  } catch (err) {
    console.error("Owner dashboard error:", err);
    res
      .status(500)
      .render("error", { title: "Error", message: "Failed to load dashboard" });
  }
};

// ➕ Show form to create a new listing
exports.createForm = (req, res) =>
  res.render("properties/create", { title: "New Listing", user: req.user });

// 💾 Create listing with image upload (Multer disk)
exports.create = async (req, res) => {
  try {
    const { title, address, city, rent, facilities, description, imageUrls } =
      req.body;

    // Files saved by Multer (diskStorage). f.filename is what we served at /uploads/<filename>
    const imagesFromUpload = (req.files || []).map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
    }));

    // Optional: extra image URLs manually entered
    const imagesFromUrls = (imageUrls || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => ({ url, filename: null }));

    const property = await Property.create({
      owner: req.user._id,
      title,
      address,
      city,
      rent,
      facilities: (facilities || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description,
      images: [...imagesFromUpload, ...imagesFromUrls],
    });

    res.redirect(`/properties/${property._id}`);
  } catch (err) {
    console.error("Create listing error:", err);
    res
      .status(500)
      .render("error", { title: "Error", message: "Unable to create listing" });
  }
};

// 📸 Add more images to existing listing (Multer disk)
exports.addImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .render("error", { title: "Not found", message: "Listing not found" });
    }

    if (String(property.owner) !== String(req.user._id)) {
      return res
        .status(403)
        .render("error", { title: "Forbidden", message: "Not your listing" });
    }

    const newImages = (req.files || []).map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
    }));

    property.images.push(...newImages);
    await property.save();

    res.redirect(`/properties/${property._id}`);
  } catch (err) {
    console.error("Add images error:", err);
    res
      .status(500)
      .render("error", { title: "Error", message: "Unable to add images" });
  }
};

// ❌ Delete a specific image from listing (removes from DB and disk)
exports.deleteImage = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res
        .status(404)
        .render("error", { title: "Not found", message: "Listing not found" });
    }

    if (String(property.owner) !== String(req.user._id)) {
      return res
        .status(403)
        .render("error", { title: "Forbidden", message: "Not your listing" });
    }

    // Remove from DB
    property.images = property.images.filter(
      (img) => img.filename !== filename
    );
    await property.save();

    // Remove file from disk (ignore if missing)
    if (filename) {
      const uploadsDir = path.join(__dirname, "..", "..", "uploads");
      const filePath = path.join(uploadsDir, filename);
      await fs.unlink(filePath).catch(() => {});
    }

    res.redirect(`/properties/${property._id}`);
  } catch (err) {
    console.error("Delete image error:", err);
    res
      .status(500)
      .render("error", { title: "Error", message: "Unable to delete image" });
  }
};
