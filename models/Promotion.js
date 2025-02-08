const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Promotion = sequelize.define("Promotion", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parkId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true, // Добавляет createdAt и updatedAt
});

module.exports = Promotion;
