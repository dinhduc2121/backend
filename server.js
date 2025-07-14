// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import cardDepositRoutes from "./routes/cardDeposit.js";
import { sequelize } from "./database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import commentRoutes from "./routes/commentRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import comicRoutes from "./routes/comic.js";
import ratingRouter from "./routes/ratings.js";
import depositRouter from "./routes/deposit.js";
import { Comic } from "./models/Comic.js";
import { ReadingHistory } from "./models/ReadingHistory.js";
import { FollowedComic } from "./models/FollowedComic.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable gzip
app.use(compression());

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://truyentranh-six.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON
app.use(express.json());

// Force UTF-8
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return originalJson.call(this, body);
  };
  next();
});

// Routers
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/comic", comicRoutes);
app.use("/api/ratings", ratingRouter);
app.use("/api/deposit", depositRouter);
app.use("/api/card-deposits", cardDepositRoutes);


// Models relations
Comic.hasMany(ReadingHistory, { foreignKey: "comicSlug", sourceKey: "slug" });
ReadingHistory.belongsTo(Comic, { foreignKey: "comicSlug", targetKey: "slug" });

Comic.hasMany(FollowedComic, { foreignKey: "comicSlug", sourceKey: "slug" });
FollowedComic.belongsTo(Comic, { foreignKey: "comicSlug", targetKey: "slug" });

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "API endpoint không tồn tại." });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("❌ Lỗi không mong đợi:", err);
  res.status(500).json({ message: "Đã xảy ra lỗi server." });
});

// Start server
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
