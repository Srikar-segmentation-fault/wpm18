// app_server/models/db.js
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI is not set. Put it in your .env");
  process.exit(1);
}

mongoose.set("strictQuery", true);

const connPromise = mongoose
  .connect(uri)
  .then((conn) => {
    console.log("✅ MongoDB Atlas connected successfully");
    return conn;
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    // Exit so nodemon restarts after you fix IP/credentials
    process.exit(1);
  });

module.exports = { mongoose, connPromise };
