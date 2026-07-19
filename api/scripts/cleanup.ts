import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";

async function cleanup() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;

  const indexes = await db.collection("users").indexes();
  console.log("Current indexes:", JSON.stringify(indexes, null, 2));

  for (const idx of indexes) {
    if (idx.name === "username_1") {
      await db.collection("users").dropIndex("username_1");
      console.log("Dropped username_1 index");
    }
  }

  await db.collection("users").deleteMany({});
  console.log("Cleared all users");

  await mongoose.disconnect();
}

cleanup();
