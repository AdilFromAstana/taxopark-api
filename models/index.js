const sequelize = require("../db");

const City = require("./City");
const Park = require("./Park");
const Form = require("./Form");
const Promotion = require("./Promotion");
const FormStatus = require("./FormStatus");
const FormStatusHistory = require("./FormStatusHistory");

Park.hasMany(Promotion, { foreignKey: "parkId", as: "promotions" });
Promotion.belongsTo(Park, { foreignKey: "parkId", as: "park" });
Park.belongsTo(City, { foreignKey: "cityId", targetKey: "id" });
Form.belongsTo(Park, { foreignKey: "parkId", targetKey: "id" });
FormStatusHistory.belongsTo(Form, { foreignKey: "formId", targetKey: "id" });

module.exports = {
  Park,
  City,
  Form,
  FormStatus,
  FormStatusHistory,
  Promotion,
  sequelize,
};
