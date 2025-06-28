import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Helper: Tính tu vi dựa trên tổng số chương đã đọc
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

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
}

// Theo dõi truyện
router.post("/follow", auth, async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ message: "Thiếu slug truyện" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  if (!user.followedComics.includes(slug)) user.followedComics.push(slug);
  await user.save();
  res.json({ success: true, followedComics: user.followedComics });
});

// Bỏ theo dõi truyện
router.post("/unfollow", auth, async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ message: "Thiếu slug truyện" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  user.followedComics = user.followedComics.filter(s => s !== slug);
  await user.save();
  res.json({ success: true, followedComics: user.followedComics });
});

// Lấy danh sách truyện đã theo dõi
router.get("/followed", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ followedComics: user.followedComics || [] });
});

// Kiểm tra đã theo dõi truyện chưa
router.get("/is-following/:slug", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const { slug } = req.params;
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  const isFollowing = user.followedComics.includes(slug);
  res.json({ isFollowing });
});

// Lưu lịch sử đọc
router.post("/history", auth, async (req, res) => {
  const { slug, chapter } = req.body;
  if (!slug || !chapter) return res.status(400).json({ message: "Thiếu slug hoặc chapter" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

  if (!Array.isArray(user.readingHistory)) {
    user.readingHistory = [];
  }

  const idx = user.readingHistory.findIndex(h => h.slug === slug);
  let prevChapter = null;
  if (idx !== -1) {
    prevChapter = user.readingHistory[idx].chapter;
  }

  const parseNum = ch => {
    const n = parseFloat(String(ch).replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const newNum = parseNum(chapter);
  const prevNum = parseNum(prevChapter);

  let updateHistory;
  if (idx !== -1) {
    if (newNum >= prevNum) {
      user.readingHistory[idx].chapter = chapter;
      user.readingHistory[idx].updatedAt = new Date();
    }
    updateHistory = user.readingHistory;
  } else {
    updateHistory = [{ slug, chapter, updatedAt: new Date() }, ...user.readingHistory];
  }
  updateHistory = updateHistory.slice(0, 100);

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { readingHistory: updateHistory } },
    { new: true }
  );

  res.json({ success: true, readingHistory: updatedUser.readingHistory });
});

// Lấy lịch sử đọc
router.get("/history", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ readingHistory: user.readingHistory || [] });
});

// Lấy thông tin tài khoản
router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  const totalChapters = user.readingHistory.length;
  const newTuVi = calcTuVi(totalChapters);
  if (user.tuVi !== newTuVi) {
    user.tuVi = newTuVi;
    await user.save();
  }
  res.json({
    username: user.username,
    email: user.email,
    linhThach: user.linhThach,
    tuVi: user.tuVi,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

// Cập nhật email
router.post("/update-email", auth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Thiếu email" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  user.email = email;
  await user.save();
  res.json({ success: true, email });
});

// Cập nhật mật khẩu
router.post("/update-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: "Thiếu thông tin mật khẩu" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true });
});

// Cập nhật tu vi
router.post("/tu-vi", auth, async (req, res) => {
  const { tuVi } = req.body;
  if (!tuVi) return res.status(400).json({ message: "Thiếu tu vi" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  user.tuVi = tuVi;
  await user.save();
  res.json({ success: true, tuVi: user.tuVi });
});

// Lấy số dư linh thạch
router.get("/linh-thach", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ linhThach: user.linhThach });
});

// Cộng/trừ linh thạch
router.post("/linh-thach", auth, async (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== "number") return res.status(400).json({ message: "Số lượng linh thạch không hợp lệ" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  user.linhThach = (user.linhThach || 0) + Number(amount);
  if (user.linhThach < 0) return res.status(400).json({ message: "Linh thạch không thể âm" });
  await user.save();
  res.json({ linhThach: user.linhThach });
});

// API admin lấy danh sách tài khoản
router.get("/admin/users", auth, isAdmin, async (req, res) => {
  const users = await User.find({}, "-password");
  res.json({ users });
});

// API admin thay đổi vai trò người dùng
router.post("/role", auth, isAdmin, async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !["admin", "member"].includes(role)) {
    return res.status(400).json({ message: "Thông tin không hợp lệ" });
  }
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  user.role = role;
  await user.save();
  res.json({ success: true, role });
});

export default router;