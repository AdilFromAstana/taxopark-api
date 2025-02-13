const { DataTypes } = require("sequelize");
const FormStatus = require("./FormStatus");
const sequelize = require("../db");

const FormStatusHistory = sequelize.define("FormStatusHistory", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    formId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    newStatusCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
});

module.exports = FormStatusHistory;