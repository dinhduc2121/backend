import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Helper: Tính tu vi dựa trên số chương đã đọc
function calcTuVi(chapterCount) {
  if (chapterCount < 100) return "Phàm Nhân";
  if (chapterCount < 200) return "Luyện Khí";
  if (chapterCount < 400) return "Trúc Cơ";
  if (chapterCount < 800) return "Kim Đan";
  if (chapterCount < 1600) return "Nguyên Anh";
  if (chapterCount < 3200) return "Hóa Thần";
  if (chapterCount < 6400) return "Phân Thần";
  if (chapterCount < 12800) return "Hợp Thể";
  if (chapterCount < 25600) return "Đại Thừa";
  if (chapterCount < 51200) return "Độ Kiếp";
  return "Tiên Nhân";
}

// Middleware kiểm tra admin
function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Không có quyền admin" });
  next();
}

// Theo dõi truyện
router.post("/follow", auth, async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ message: "Thiếu slug truyện" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  let followed = user.followedComics || [];
  if (!followed.includes(slug)) followed.push(slug);
  await user.update({ followedComics: followed });

  res.json({ success: true, followedComics: followed });
});

// Bỏ theo dõi
router.post("/unfollow", auth, async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ message: "Thiếu slug truyện" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  const followed = (user.followedComics || []).filter(s => s !== slug);
  await user.update({ followedComics: followed });

  res.json({ success: true, followedComics: followed });
});

// Danh sách theo dõi
router.get("/followed", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ followedComics: user.followedComics || [] });
});

// Kiểm tra đang theo dõi
router.get("/is-following/:slug", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  const isFollowing = (user.followedComics || []).includes(req.params.slug);
  res.json({ isFollowing });
});

// Lưu lịch sử đọc
router.post("/history", auth, async (req, res) => {
  const { slug, chapter } = req.body;
  if (!slug || !chapter) return res.status(400).json({ message: "Thiếu slug hoặc chapter" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  let history = user.readingHistory || [];

  const idx = history.findIndex(h => h.slug === slug);
  if (idx !== -1) {
    // Cập nhật chương mới nếu lớn hơn
    const parseNum = ch => parseFloat(String(ch).replace(/[^\d.]/g, "")) || 0;
    if (parseNum(chapter) >= parseNum(history[idx].chapter)) {
      history[idx].chapter = chapter;
      history[idx].updatedAt = new Date();
    }
  } else {
    history.unshift({ slug, chapter, updatedAt: new Date() });
  }
  history = history.slice(0, 100);

  await user.update({ readingHistory: history });

  res.json({ success: true, readingHistory: history });
});

// Lấy lịch sử đọc
router.get("/history", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ readingHistory: user.readingHistory || [] });
});

// Lấy thông tin tài khoản
router.get("/profile", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  const totalChapters = (user.readingHistory || []).length;
  const newTuVi = calcTuVi(totalChapters);

  if (user.tuVi !== newTuVi) {
    await user.update({ tuVi: newTuVi });
  }

  res.json({
    username: user.username,
    email: user.email,
    linhThach: user.linhThach,
    tuVi: newTuVi,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

// Cập nhật email
router.post("/update-email", auth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Thiếu email" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  await user.update({ email });
  res.json({ success: true, email });
});

// Cập nhật mật khẩu
router.post("/update-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: "Thiếu thông tin" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

  const hash = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hash });

  res.json({ success: true });
});

// Cập nhật tu vi thủ công
router.post("/tu-vi", auth, async (req, res) => {
  const { tuVi } = req.body;
  if (!tuVi) return res.status(400).json({ message: "Thiếu tu vi" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  await user.update({ tuVi });
  res.json({ success: true, tuVi });
});

// Lấy linh thạch
router.get("/linh-thach", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ linhThach: user.linhThach });
});

// Cộng/trừ linh thạch
router.post("/linh-thach", auth, async (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== "number") return res.status(400).json({ message: "Số lượng không hợp lệ" });

  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  const newBalance = (user.linhThach || 0) + amount;
  if (newBalance < 0) return res.status(400).json({ message: "Không đủ linh thạch" });

  await user.update({ linhThach: newBalance });
  res.json({ linhThach: newBalance });
});

// Lấy danh sách tài khoản (admin)
router.get("/admin/users", auth, isAdmin, async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] }
  });
  res.json({ users });
});

// Thay đổi vai trò user
router.post("/role", auth, isAdmin, async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !["admin", "member"].includes(role)) {
    return res.status(400).json({ message: "Thông tin không hợp lệ" });
  }

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  await user.update({ role });
  res.json({ success: true, role });
});

export default router;
