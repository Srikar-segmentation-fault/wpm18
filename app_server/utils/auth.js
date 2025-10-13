const jwt = require("jsonwebtoken");

const issueToken = (user) =>
  jwt.sign(
    { _id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );

const requireAuth =
  (roles = []) =>
  (req, res, next) => {
    if (!req.user) return res.redirect("/auth/login");
    if (roles.length && !roles.includes(req.user.role)) {
      return res
        .status(403)
        .render("error", { title: "Forbidden", message: "Access denied" });
    }
    next();
  };

const requireGuest = () => (req, res, next) => {
  if (req.user) return res.redirect("/properties");
  next();
};

module.exports = { issueToken, requireAuth, requireGuest };
