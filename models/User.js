import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linhThach: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tuVi: {
    type: DataTypes.STRING,
    defaultValue: "Phàm Nhân"
  },
  realm: {
    type: DataTypes.STRING,
    defaultValue: "Phàm Nhân"
  },
  role: {
    type: DataTypes.ENUM("admin", "member"),
    defaultValue: "member"
  },
  nameColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nameEffect: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatarFrame: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vipLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followedComics: {
    type: DataTypes.JSON,
    allowNull: true
  },
  readingHistory: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true
});
