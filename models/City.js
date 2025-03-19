const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const City = sequelize.define("City", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  title: { type: DataTypes.STRING, allowNull: false, unique: true },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

module.exports = City;
