// deleteUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./app_server/models/user");

async function deleteAllUsers() {
  try {
    const uri = process.env.MONGO_URI; // <-- use MONGO_URI
    if (!uri) throw new Error("MONGO_URI is missing. Put it in your .env");

    await mongoose.connect(uri);
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users.`);
  } catch (err) {
    console.error("❌ Error deleting users:", err);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAllUsers();
