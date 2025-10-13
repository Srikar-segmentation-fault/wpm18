const mongoose = require("mongoose");

const uri = process.env.MONGO_URI; // <-- must be set on Render

if (!uri) {
  console.error(
    "❌ MONGO_URI is not set. Configure it in Render → Environment."
  );
  process.exit(1);
}

mongoose
  .connect(uri)
  .then((conn) => {
    const host = conn.connection.host;
    const dbname = conn.connection.name;
    console.log("✅ MongoDB Atlas connected successfully");
    console.log(`→ Host: ${host}  DB: ${dbname}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
