import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";

export const Comment = sequelize.define("Comment", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comicSlug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Tên hiển thị đặc biệt
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // URL hoặc ID khung avatar
  avatarFrame: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Cảnh giới tại thời điểm bình luận
  realm: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Màu chữ riêng
  nameColor: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Hiệu ứng chữ (glow, rainbow, v.v.)
  nameEffect: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Số lượt thích
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // Đánh dấu comment nổi bật
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // ID comment cha (reply)
  replyTo: {
    type: DataTypes.INTEGER,
    allowNull: true
  }

}, {
  timestamps: true
});

// Tạo liên kết với User
Comment.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Comment, { foreignKey: "userId" });
