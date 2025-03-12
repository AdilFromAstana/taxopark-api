const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  userName: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  // roles: {
  //   type: DataTypes.ARRAY(DataTypes.STRING),
  //   allowNull: false,
  //   validate: {
  //     isValidRole(value) {
  //       const allowedRoles = ["manager", "admin"];
  //       if (
  //         !Array.isArray(value) ||
  //         value.some((role) => !allowedRoles.includes(role))
  //       ) {
  //         throw new Error(
  //           "Роли должны быть массивом, содержащим 'manager' или 'admin'"
  //         );
  //       }
  //     },
  //   },
  // },
  roles: {
    type: DataTypes.JSON, // Используем JSON вместо ARRAY
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidRole(value) {
        const allowedRoles = ["manager", "admin"];
        if (
          !Array.isArray(value) ||
          value.some((role) => !allowedRoles.includes(role))
        ) {
          throw new Error(
            "Роли должны быть массивом, содержащим 'manager' или 'admin'"
          );
        }
      },
    },
  },
});

module.exports = User;
