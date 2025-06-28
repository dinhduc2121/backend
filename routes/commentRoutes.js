import express from "express";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
  console.log("Checking isAdmin, req.user:", req.user);
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
}

// Thêm bình luận
router.post("/", auth, async (req, res) => {
  const { comicSlug, content } = req.body;
  if (!comicSlug || !content) return res.status(400).json({ message: "Thiếu thông tin bình luận" });
  try {
    const comment = new Comment({
      userId: req.user.id,
      username: req.user.username,
      comicSlug,
      content
    });
    await comment.save();
    res.json({ success: true, comment });
  } catch (err) {
    console.error("Error in POST /comment:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// Lấy danh sách bình luận (cho admin hoặc theo comicSlug)
router.get("/", auth, async (req, res) => {
  try {
    const { comicSlug } = req.query;
    const query = comicSlug ? { comicSlug } : {};
    const comments = await Comment.find(query).sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    console.error("Error in GET /comment:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// Xóa bình luận (chỉ admin)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy bình luận" });
    res.json({ success: true, message: "Xóa bình luận thành công" });
  } catch (err) {
    console.error("Error in DELETE /comment/:id:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

export default router;