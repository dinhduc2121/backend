import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

console.log("Environment variables:", {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT
});

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ message: "Lỗi server: " + err.message });
});

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.stack);
    process.exit(1);
  });