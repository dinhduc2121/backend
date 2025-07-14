import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { FollowedComic } from "../models/FollowedComic.js";
import { ReadingHistory } from "../models/ReadingHistory.js";
import auth from "../middleware/auth.js";
import { Comic } from "../models/Comic.js";


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
router.post("/follow", auth, async (req, res) => {
  const { slug, name } = req.body; // THÊM name
  if (!slug) return res.status(400).json({ error: "Thiếu slug" });

  try {
    const exist = await FollowedComic.findOne({
      where: { userId: req.user.id, comicSlug: slug }
    });

    if (exist) {
      return res.status(400).json({ error: "Bạn đã theo dõi truyện này" });
    }

    await FollowedComic.create({
      userId: req.user.id,
      comicSlug: slug
    });

    let comic = await Comic.findOne({ where: { slug } });
    if (!comic) {
      if (!name) return res.status(400).json({ error: "Thiếu name để tạo mới comic" });
      comic = await Comic.create({
        slug,
        name,
        followers: 1
      });
    } else {
      comic.followers += 1;
      await comic.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi follow:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Bỏ theo dõi
router.post("/unfollow", auth, async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: "Thiếu slug" });

  try {
    const exist = await FollowedComic.findOne({
      where: { userId: req.user.id, comicSlug: slug }
    });

    if (!exist) {
      return res.status(400).json({ error: "Bạn chưa theo dõi truyện này" });
    }

    await exist.destroy();

    let comic = await Comic.findOne({ where: { slug } });
    if (comic && comic.followers > 0) {
      comic.followers -= 1;
      await comic.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi unfollow:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});


// Danh sách theo dõi
router.get("/followed", auth, async (req, res) => {
  const comics = await FollowedComic.findAll({ where: { userId: req.user.id } });
  res.json({ followedComics: comics.map(c => c.comicSlug) });
});

// Kiểm tra đang theo dõi
router.get("/is-following/:slug", auth, async (req, res) => {
  const exist = await FollowedComic.findOne({ where: { userId: req.user.id, comicSlug: req.params.slug } });
  res.json({ isFollowing: !!exist });
});

// Lưu lịch sử đọc
router.post("/history", auth, async (req, res) => {
  const { slug, chapter } = req.body;
  if (!slug || !chapter) return res.status(400).json({ message: "Thiếu slug hoặc chapter" });

  // Tìm hoặc tạo bản ghi lịch sử đọc cho user + truyện
  const [history, created] = await ReadingHistory.findOrCreate({
    where: { userId: req.user.id, comicSlug: slug },
    defaults: { chapter, updatedAt: new Date() }
  });

  if (!created) {
    // Cập nhật nếu chương mới lớn hơn
    const parseNum = ch => parseFloat(String(ch).replace(/[^\d.]/g, "")) || 0;
    if (parseNum(chapter) >= parseNum(history.chapter)) {
      history.chapter = chapter;
      history.updatedAt = new Date();
      await history.save();
    }
  }

  res.json({ success: true });
});

// Lấy lịch sử đọc (chỉ trả về 1 bản ghi cho mỗi truyện)
router.get("/history", auth, async (req, res) => {
  const history = await ReadingHistory.findAll({
    where: { userId: req.user.id },
    order: [["updatedAt", "DESC"]]
  });
  // Không cần filter vì mỗi userId + comicSlug chỉ có 1 bản ghi
  res.json({ readingHistory: history.map(h => ({
    slug: h.comicSlug,
    chapter: h.chapter,
    updatedAt: h.updatedAt
  })) });
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

// routers/user.js
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'linhThach'],
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Lỗi lấy thông tin user:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


export default router;

