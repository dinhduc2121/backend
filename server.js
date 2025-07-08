import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Khởi tạo Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: true,
  }
);

// Kiểm tra kết nối MySQL
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công!");

    // Đồng bộ Models (tạo bảng nếu chưa có)
    await sequelize.sync();
    console.log("✅ Đồng bộ Models thành công!");

    // Bắt đầu server
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
    process.exit(1);
  }
})();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://truyentranh-six.vercel.app",
      "https://truyentranh-git-main-mongtruyen.vercel.app",
      "https://truyentranh-fka4ttdmm-mongtruyen.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON body parser
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi toàn cục:", err.stack);
  res.status(500).json({ message: "Lỗi server: " + err.message });
});
