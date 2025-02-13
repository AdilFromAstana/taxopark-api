const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Form = sequelize.define("Form", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  parkId: { type: DataTypes.UUID, allowNull: true },
  statusCode: { type: DataTypes.STRING, allowNull: false },
  formType: {
    type: DataTypes.ENUM("consultation", "taxiPark"),
    allowNull: false,
  },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Form;
