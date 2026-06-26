import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db!;
    const collection = db.collection("adminusers");

    const existing = await collection.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin account already exists!");
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("admin123", salt);

    await collection.insertOne({
      username: "admin",
      password: hashed,
      fullName: "Admin CineZ",
      email: "admin@cinez.vn",
      phone: "0900000000",
      role: "admin",
      active: true,
      createdAt: new Date(),
    });

    console.log("✓ Admin account created successfully!");
    console.log("   Username: admin");
    console.log("   Password: admin123");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

createAdmin();
