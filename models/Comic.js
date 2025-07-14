// models/Comic.js
import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const Comic = sequelize.define("Comic", {
  slug: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  followers: { type: DataTypes.INTEGER, defaultValue: 0 },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.INTEGER, defaultValue: 0 },
});
