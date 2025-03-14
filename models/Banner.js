const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Banner = sequelize.define("Banner", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  bannerUrl: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false, defaultValue: "-" },
  link: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Banner;
