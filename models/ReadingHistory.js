import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const ReadingHistory = sequelize.define("ReadingHistory", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  comicSlug: { type: DataTypes.STRING, allowNull: false },
  chapter: { type: DataTypes.STRING, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: false });
