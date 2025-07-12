import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import commentRoutes from "./routes/commentRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://truyentranh-six.vercel.app",
    "https://truyentranh-git-main-mongtruyen.vercel.app",
    "https://truyentranh-fka4ttdmm-mongtruyen.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/quote", quoteRoutes);


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
