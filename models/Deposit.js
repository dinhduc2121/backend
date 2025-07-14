// models/Deposit.js
import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";

export const Deposit = sequelize.define(
  "Deposit",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    method: {
      type: DataTypes.ENUM("bank", "momo", "zalopay", "card"),
      allowNull: false,
      defaultValue: "bank",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    cardType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cardSerial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cardCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Quan hệ
Deposit.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Deposit, { foreignKey: "userId" });
