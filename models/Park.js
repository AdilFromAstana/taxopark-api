const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Park = sequelize.define("Park", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  parkEntrepreneurSupport: { type: DataTypes.BOOLEAN, allowNull: true },
  entrepreneurSupport: { type: DataTypes.BOOLEAN, allowNull: true },
  commissionWithdraw: { type: DataTypes.DECIMAL, allowNull: true },
  transferPaymentCommission: { type: DataTypes.DECIMAL, allowNull: true },
  accountantSupport: { type: DataTypes.BOOLEAN, allowNull: true },
  yandexGasStation: { type: DataTypes.BOOLEAN, allowNull: true },
  supportStartWorkTime: { type: DataTypes.STRING, allowNull: true },
  supportEndWorkTime: { type: DataTypes.STRING, allowNull: true },
  supportAlwaysAvailable: { type: DataTypes.BOOLEAN, allowNull: true },
  parkCommission: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  },
  parkPromotions: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
    validate: {
      isValidArray(value) {
        if (!Array.isArray(value)) {
          throw new Error("Значение должно быть массивом.");
        }
        if (value.some((num) => typeof num !== "number" || num <= 0)) {
          throw new Error(
            "Все элементы массива должны быть положительными числами."
          );
        }
      },
    },
    defaultValue: [],
  },
  paymentType: { type: DataTypes.INTEGER, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  rating: { type: DataTypes.DECIMAL, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true, unique: false },
  isPartner: { type: DataTypes.BOOLEAN, allowNull: true },
  additionalInfo: { type: DataTypes.TEXT, allowNull: true },
  cityIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
    defaultValue: [],
  },
  title: { type: DataTypes.STRING, allowNull: false },
  averageCheck: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  carRentals: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  commissionRates: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
});

module.exports = Park;
