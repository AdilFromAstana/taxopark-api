const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const Form = require("./Form");

const SmsCode = sequelize.define("SmsCode", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  formId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Form,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  otpCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = SmsCode;
