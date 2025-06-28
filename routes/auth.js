import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Đăng ký
router.post("https://backend-production-3828.up.railway.app/register", async (req, res) => {
  const { username, password, email, tuVi, role } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Thiếu tên tài khoản hoặc mật khẩu" });
  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ success: false, message: "Tài khoản đã tồn tại" });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hash,
    email,
    linhThach: 0,
    tuVi: tuVi || "Phàm Nhân",
    role: role === "admin" ? "admin" : "member",
    followedComics: [],
    readingHistory: []
  });
  await user.save();
  res.json({ success: true, message: "Đăng ký thành công" });
});

// Đăng nhập
router.post("https://backend-production-3828.up.railway.app/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Thiếu tên tài khoản hoặc mật khẩu" });
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token, username: user.username, role: user.role });
});

// Đổi mật khẩu
router.post("https://backend-production-3828.up.railway.app/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(400).json({ success: false, message: "Mật khẩu cũ không đúng" });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true, message: "Đổi mật khẩu thành công" });
});

export default router;