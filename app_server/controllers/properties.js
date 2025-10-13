const Property = require("../models/property");
const Booking = require("../models/booking");

exports.listAll = async (req, res) => {
  const properties = await Property.find().sort({ createdAt: -1 });
  res.render("properties/list", {
    title: "Find PGs & Rooms",
    properties,
  });
};
exports.details = async (req, res) => {
  const p = await Property.findById(req.params.id).populate(
    "owner",
    "name email phone"
  );
  if (!p)
    return res
      .status(404)
      .render("error", { title: "Not found", message: "Listing not found" });
  res.render("properties/details", {
    title: p.title,
    property: p,
    user: req.user,
  });
};
exports.createForm = (req, res) =>
  res.render("properties/create", { title: "New Listing" });
exports.create = async (req, res) => {
  const { title, address, city, rent, facilities, description, images } =
    req.body;
  await Property.create({
    owner: req.user._id,
    title,
    address,
    city,
    rent,
    facilities: (facilities || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    images: (images || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    description,
  });
  res.redirect("/dashboard");
};
exports.ownerDashboard = async (req, res) => {
  const myProps = await Property.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });
  const incoming = await Booking.find({})
    .populate("property requester", "title name email owner")
    .sort({ createdAt: -1 });
  const mine = incoming.filter(
    (b) => b.property && String(b.property.owner) === String(req.user._id)
  );
  res.render("dashboard/owner", {
    title: "Owner Dashboard",
    props: myProps,
    bookings: mine,
  });
};
