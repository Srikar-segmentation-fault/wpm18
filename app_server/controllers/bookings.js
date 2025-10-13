const Booking = require("../models/booking");
exports.requestBooking = async (req, res) => {
  const { message, moveInDate } = req.body;
  await Booking.create({
    property: req.params.id,
    requester: req.user._id,
    message,
    moveInDate,
  });
  res.redirect(`/properties/${req.params.id}?requested=1`);
};
exports.updateStatus = async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.bookingId, {
    status: req.body.status,
  });
  res.redirect("/dashboard");
};
