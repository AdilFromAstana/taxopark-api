const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Commission = sequelize.define("Commission", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false, unique: true },
  sum: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
});

module.exports = Commission;
