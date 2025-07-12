import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";

export const Comment = sequelize.define("Comment", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  comicSlug: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  displayName: { type: DataTypes.STRING },
  avatarFrame: { type: DataTypes.STRING },
  realm: { type: DataTypes.STRING },
  nameColor: { type: DataTypes.STRING },
  nameEffect: { type: DataTypes.STRING },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  replyTo: { type: DataTypes.INTEGER }
}, { 
  timestamps: true,
  tableName: "comments"
});

Comment.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Comment, { foreignKey: "userId" });