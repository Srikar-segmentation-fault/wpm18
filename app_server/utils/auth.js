const jwt = require("jsonwebtoken");

// Use a safe fallback in dev so the app still runs locally
const SECRET = process.env.JWT_SECRET || "devsecret";

/** Issue a JWT for a user */
const issueToken = (user) =>
  jwt.sign(
    { _id: String(user._id), role: user.role, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );

/** Extract token from cookie or Bearer header */
const getTokenFromReq = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return null;
};

/**
 * Require a logged-in user (optionally restricted to roles)
 * - Redirects to /auth/login if not authenticated
 * - If app.js has already set req.user, uses it; otherwise verifies token here
 */
const requireAuth =
  (roles = []) =>
  (req, res, next) => {
    try {
      // Prefer what app.js set
      if (!req.user) {
        const token = getTokenFromReq(req);
        if (!token) return res.redirect("/auth/login");
        const payload = jwt.verify(token, SECRET);
        req.user = payload;
        res.locals.user = payload;
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .render("error", { title: "Forbidden", message: "Access denied" });
      }

      return next();
    } catch (err) {
      return res.redirect("/auth/login");
    }
  };

/**
 * Require the user to be logged OUT (for login/register pages)
 * - If already logged in, send them to /properties
 */
const requireGuest = () => (req, res, next) => {
  if (req.user) return res.redirect("/properties");
  return next();
};

module.exports = { issueToken, requireAuth, requireGuest };
