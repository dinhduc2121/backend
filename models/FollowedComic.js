import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const FollowedComic = sequelize.define("FollowedComic", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  comicSlug: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });
