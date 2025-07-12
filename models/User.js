import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  linhThach: { type: DataTypes.INTEGER, defaultValue: 0 },
  tuVi: { type: DataTypes.STRING, defaultValue: "Phàm Nhân" },
  realm: { type: DataTypes.STRING, defaultValue: "Phàm Nhân" },
  role: { type: DataTypes.ENUM("admin","member"), defaultValue: "member" },
  nameColor: { type: DataTypes.STRING },
  nameEffect: { type: DataTypes.STRING },
  avatarFrame: { type: DataTypes.STRING },
  avatarUrl: { type: DataTypes.STRING },
  vipLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
  badge: { type: DataTypes.STRING },
  isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { 
  timestamps: true,
});
