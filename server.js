import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://truyentranh-six.vercel.app",
    "https://truyentranh-git-main-mongtruyen.vercel.app",
    "https://truyentranh-fka4ttdmm-mongtruyen.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);

// Bắt đầu server sau khi kết nối DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công!");
    await sequelize.sync();
    console.log("✅ Đồng bộ Models thành công!");

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
    process.exit(1);
  }
})();

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi toàn cục:", err.stack);
  res.status(500).json({ message: "Lỗi server: " + err.message });
});
