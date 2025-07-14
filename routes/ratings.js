// routes/ratings.js
import express from "express";
import { ComicRating } from "../models/ComicRating.js";
import { Comic } from "../models/Comic.js";
import { User } from "../models/User.js";
import { sequelize } from "../database.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { comicSlug, rating } = req.body;

  if (!comicSlug || !rating) {
    return res.status(400).json({ message: "Thiếu thông tin." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating phải từ 1 đến 5." });
  }

  try {
    const [record, created] = await ComicRating.findOrCreate({
      where: { userId: req.user.id, comicSlug },
      defaults: { rating },
    });

    if (!created) {
      record.rating = rating;
      await record.save();
    }

    return res.json({ message: created ? "Đã tạo đánh giá" : "Đã cập nhật đánh giá", rating: record });
  } catch (err) {
    console.error("Lỗi khi tạo/cập nhật rating:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

router.get("/:comicSlug", async (req, res) => {
  const { comicSlug } = req.params;

  try {
    const ratings = await ComicRating.findAll({
      where: { comicSlug },
      include: [{ model: User, attributes: ["id", "username", "avatarUrl"] }],
    });

    return res.json({ ratings });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách rating:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

router.get("/top/list", async (req, res) => {
  try {
    const topComics = await Comic.findAll({
      attributes: [
        "slug",
        "name",
        [sequelize.fn("COUNT", sequelize.col("ComicRatings.id")), "ratingCount"],
        [sequelize.fn("AVG", sequelize.col("ComicRatings.rating")), "avgRating"],
      ],
      include: [
        {
          model: ComicRating,
          attributes: [],
          required: false
        },
      ],
      group: ["Comic.slug", "Comic.name"],
      order: [
        [sequelize.literal("ratingCount"), "DESC"],
        [sequelize.literal("avgRating"), "DESC"],
      ],
      limit: 5,
      subQuery: false,
    });

    return res.json({ topComics });
  } catch (err) {
    console.error("Lỗi khi lấy top ranking:", err);
    return res.status(500).json({
      message: "Lỗi server.",
      error: err.message
    });
  }
});


export default router;
