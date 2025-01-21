const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Token = sequelize.define("Token", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users", // Указывает на модель User
      key: "id",
    },
    onDelete: "CASCADE",
  },
  refreshToken: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
});

module.exports = Token;
