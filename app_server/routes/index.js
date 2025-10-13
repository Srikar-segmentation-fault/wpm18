const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", {
    title: "RentEase — Find PGs & Rooms Easily",
    tagline: "Room hunting made effortless — join the RentEase way.",
  });
});

router.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
    message:
      "RentEase is a web platform designed to help students and working professionals easily find and book affordable PGs (Paying Guest accommodations) and rental rooms in cities. It connects seekers with property owners, allowing owners to list properties with details like images, rent, and amenities, while seekers can search, filter, and send booking requests. The platform also provides an owner dashboard for managing listings and requests.",
  });
});

module.exports = router;
