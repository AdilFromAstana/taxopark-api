const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

module.exports = Review;
