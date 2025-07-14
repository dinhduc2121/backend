import express from "express";
import { Deposit } from "../models/Deposit.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Danh sách gói nạp kèm khuyến mãi
const packageList = [
  { amount: 500, price: 10000, discount: 0 },
  { amount: 1000, price: 20000, discount: 0 },
  { amount: 2000, price: 50000, discount: 5 },
  { amount: 5000, price: 100000, discount: 10 },
  { amount: 10000, price: 200000, discount: 15 },
  { amount: 25000, price: 500000, discount: 15 },
  { amount: 50000, price: 1000000, discount: 15 },
];

router.post("/request", auth, async (req, res) => {
  const { price, cardType, cardSerial, cardCode } = req.body;

  if (!price || price <= 0) {
    return res.status(400).json({ message: "Số tiền VNĐ không hợp lệ" });
  }

  if (!cardType || !cardSerial || !cardCode) {
    return res.status(400).json({ message: "Thiếu thông tin thẻ" });
  }

  // Tìm gói phù hợp
  const pack = packageList.find((p) => p.price === price);
  if (!pack) {
    return res.status(400).json({ message: "Không tìm thấy gói nạp phù hợp" });
  }

  // Tính khuyến mãi
  const bonus = Math.floor(pack.amount * (pack.discount / 100));
  const finalAmount = pack.amount + bonus;

  try {
    const deposit = await Deposit.create({
      userId: req.user.id,
      price: pack.price,
      amount: finalAmount,
      method: "card",
      cardType,
      cardSerial,
      cardCode,
    });

    res.json({
      success: true,
      message: `Đã gửi yêu cầu nạp thẻ ${pack.price.toLocaleString()} VND = ${finalAmount} Linh Thạch (khuyến mãi +${bonus})`,
      deposit,
    });
  } catch (err) {
    console.error("Lỗi tạo yêu cầu nạp thẻ:", err);
    res.status(500).json({ message: "Lỗi server khi tạo yêu cầu nạp thẻ" });
  }
});

export default router;
