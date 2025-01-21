const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Park = sequelize.define("Park", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  parkEntrepreneurSupport: { type: DataTypes.INTEGER, allowNull: true },
  entrepreneurSupport: { type: DataTypes.INTEGER, allowNull: true },
  commissionWithdraw: { type: DataTypes.INTEGER, allowNull: true },
  paymentsByTransfer: { type: DataTypes.BOOLEAN, allowNull: true },
  accountantSupport: { type: DataTypes.INTEGER, allowNull: true },
  yandexGasStation: { type: DataTypes.BOOLEAN, allowNull: true },
  supportWorkTime: { type: DataTypes.STRING, allowNull: true },
  parkCommission: { type: DataTypes.INTEGER, allowNull: true },
  parkPromotions: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
    validate: {
      isValidArray(value) {
        if (!Array.isArray(value) || value.some((num) => num <= 0)) {
          throw new Error(
            "Все элементы массива должны быть положительными числами."
          );
        }
      },
    },
  },
  paymentType: { type: DataTypes.INTEGER, allowNull: true },
  active: { type: DataTypes.BOOLEAN, allowNull: true },
  rating: { type: DataTypes.DECIMAL, allowNull: true },
  cityId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Park;
