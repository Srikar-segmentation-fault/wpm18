const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI not found in environment variables.");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed");
  process.exit(0);
});
