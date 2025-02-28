const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
    allowNull: false,
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = User;
