const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const FormStatus = sequelize.define("FormStatus", {
  code: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  formType: {
    type: DataTypes.ENUM("consultation", "taxiPark"),
    allowNull: true,
  },
  isCommon: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = FormStatus;
