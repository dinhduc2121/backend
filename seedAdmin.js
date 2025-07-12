import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { sequelize } from "./database.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối DB thành công");

    const hash = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hash,
      email: "admin@example.com",
      linhThach: 0,
      tuVi: "Phàm Nhân",
      role: "admin"
    });

    console.log("✅ Đã tạo user admin (admin123)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
})();
