// routers/deposit.js
import express from 'express';
import { Deposit } from '../models/Deposit.js';
import { User } from '../models/User.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// Thành viên gửi yêu cầu nạp
router.post('/request', auth, async (req, res) => {
  const { price, method, cardType, cardSerial, cardCode } = req.body;

  if (!price || price <= 0) {
    return res.status(400).json({ message: 'Số tiền VNĐ không hợp lệ' });
  }

  const amount = Math.floor(price / 20);

  if (amount <= 0) {
    return res.status(400).json({ message: 'Số lượng Linh Thạch không hợp lệ' });
  }

  if (method && !['bank', 'momo', 'zalopay', 'card'].includes(method)) {
    return res.status(400).json({ message: 'Phương thức không hợp lệ' });
  }

  if (method === 'card' && (!cardType || !cardSerial || !cardCode)) {
    return res.status(400).json({ message: 'Thiếu thông tin thẻ nạp' });
  }

  try {
    const deposit = await Deposit.create({
      userId: req.user.id,
      amount,
      price,
      method: method || 'bank',
      cardType: cardType || null,
      cardSerial: cardSerial || null,
      cardCode: cardCode || null,
    });

    res.json({ success: true, deposit });
  } catch (err) {
    console.error('Lỗi tạo yêu cầu nạp:', err);
    res.status(500).json({ message: 'Lỗi khi tạo yêu cầu nạp' });
  }
});

// Admin duyệt yêu cầu nạp
router.post('/approve/:id', auth, isAdmin, async (req, res) => {
  try {
    const deposit = await Deposit.findByPk(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
    }

    const user = await User.findByPk(deposit.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Cập nhật trạng thái
    deposit.status = 'approved';
    await deposit.save();

    // Cộng Linh Thạch
    user.linhThach = (user.linhThach || 0) + deposit.amount;
    await user.save();

    res.json({
      success: true,
      message: `Đã duyệt nạp ${deposit.price ? deposit.price.toLocaleString() : 0} VND = ${deposit.amount} Linh Thạch`,
      deposit,
    });
  } catch (err) {
    console.error('Lỗi duyệt yêu cầu:', err);
    res.status(500).json({ message: 'Lỗi khi duyệt yêu cầu' });
  }
});

// Admin từ chối yêu cầu nạp
router.post('/reject/:id', auth, isAdmin, async (req, res) => {
  try {
    const deposit = await Deposit.findByPk(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
    }

    deposit.status = 'rejected';
    await deposit.save();

    res.json({ success: true, message: 'Yêu cầu đã bị từ chối', deposit });
  } catch (err) {
    console.error('Lỗi từ chối yêu cầu:', err);
    res.status(500).json({ message: 'Lỗi khi từ chối yêu cầu' });
  }
});

// Admin xem tất cả yêu cầu nạp
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const deposits = await Deposit.findAll({
      include: {
        model: User,
        attributes: ['id', 'username'],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, deposits });
  } catch (err) {
    console.error('Lỗi lấy danh sách nạp:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nạp' });
  }
});

// Lấy lịch sử nạp của 1 user (admin)
router.get('/user/:userId', auth, isAdmin, async (req, res) => {
  try {
    const deposits = await Deposit.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, deposits });
  } catch (err) {
    console.error('Lỗi lấy lịch sử nạp:', err);
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử nạp' });
  }
});

export default router;
