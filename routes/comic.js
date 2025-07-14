// Tăng view chỉ 1 lần và trả về số liệu
import express from "express";
import auth from "../middleware/auth.js";
import { Comic } from "../models/Comic.js";
import { ReadingHistory } from "../models/ReadingHistory.js";

const router = express.Router();

router.post("/view/:slug", auth, async (req, res) => {
  const { slug } = req.params;
  const { name, chapter } = req.body;

  if (!slug) return res.status(400).json({ error: "Thiếu slug" });

  try {
    let comic = await Comic.findOne({ where: { slug } });

    if (!comic) {
      if (!name) return res.status(400).json({ error: "Thiếu tên để tạo truyện mới" });
      comic = await Comic.create({
        slug,
        name,
        views: 1
      });

      await ReadingHistory.create({
        userId: req.user.id,
        comicSlug: slug,
        chapter: chapter || "0"
      });

      return res.json({
        success: true,
        view_count: 1,
        followers: 0,
        rating: 0
      });
    }

    const exist = await ReadingHistory.findOne({
      where: { userId: req.user.id, comicSlug: slug }
    });

    if (!exist) {
      comic.views += 1;
      await comic.save();

      await ReadingHistory.create({
        userId: req.user.id,
        comicSlug: slug,
        chapter: chapter || "0"
      });
    }

    res.json({
      success: true,
      view_count: comic.views,
      followers: comic.followers || 0,
      rating: comic.rating || 0
    });
  } catch (err) {
    console.error("Lỗi tăng view:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;
