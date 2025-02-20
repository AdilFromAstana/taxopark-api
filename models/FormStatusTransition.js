const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const FormStatus = require("./FormStatus");

const FormStatusTransition = sequelize.define("FormStatusTransition", {
  fromStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: FormStatus,
      key: "code",
    },
    primaryKey: true,
  },
  toStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: FormStatus,
      key: "code",
    },
    primaryKey: true,
  },
  formType: {
    type: DataTypes.ENUM("consultation", "taxiPark"),
    allowNull: true,
  },
  requires_reason: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = FormStatusTransition;
