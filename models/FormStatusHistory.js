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
    newStatusId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: FormStatus,
            key: "id",
        },
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
});

module.exports = FormStatusHistory;