// models/ComicRating.js
import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";
import { Comic } from "./Comic.js";

export const ComicRating = sequelize.define("ComicRating", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  comicSlug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
}, {
  timestamps: true,
  tableName: "ComicRatings",
});

// Associations
ComicRating.belongsTo(User, { foreignKey: "userId" });
ComicRating.belongsTo(Comic, { foreignKey: "comicSlug", targetKey: "slug" });

User.hasMany(ComicRating, { foreignKey: "userId" });
Comic.hasMany(ComicRating, { foreignKey: "comicSlug", sourceKey: "slug" });
