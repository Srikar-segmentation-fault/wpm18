const User = require("../models/user");
exports.viewProfile = async (req, res) => {
  const u = await User.findById(req.user._id);
  res.render("profile/view", { title: "Profile", u });
};
exports.editProfile = async (req, res) => {
  const { name, phone, bio, avatarUrl } = req.body;
  await User.findByIdAndUpdate(req.user._id, { name, phone, bio, avatarUrl });
  res.redirect("/profile");
};
