const sequelize = require("../db");

const User = require("./User");
const City = require("./City");
const Park = require("./Park");
const Form = require("./Form");
const Promotion = require("./Promotion");
const FormStatus = require("./FormStatus");
const FormStatusHistory = require("./FormStatusHistory");
const FormStatusTransition = require("./FormStatusTransition");
const Banner = require("./Banner");
const Review = require("./Review");
const Commission = require("./Commission");

Park.hasMany(Promotion, { foreignKey: "parkId" });
Promotion.belongsTo(Park, { foreignKey: "parkId" });

Form.belongsTo(Park, { foreignKey: "parkId", targetKey: "id" });

Form.hasOne(FormStatus, {
  foreignKey: "code",
  sourceKey: "statusCode",
  as: "status",
});
FormStatus.belongsTo(Form, { foreignKey: "code", targetKey: "statusCode" });

FormStatusHistory.belongsTo(Form, { foreignKey: "formId", targetKey: "id" });
FormStatusHistory.belongsTo(FormStatus, {
  foreignKey: "newStatusCode",
  targetKey: "code",
  as: "statusDetail",
});

// Переходы статусов
FormStatusTransition.belongsTo(FormStatus, {
  foreignKey: "toStatus",
  targetKey: "code",
  as: "toStatusDetail",
});
FormStatusTransition.belongsTo(FormStatus, {
  foreignKey: "fromStatus",
  targetKey: "code",
  as: "fromStatusDetail",
});

module.exports = {
  Park,
  City,
  Form,
  FormStatus,
  FormStatusHistory,
  Promotion,
  FormStatusTransition,
  Banner,
  Review,
  User,
  Commission,
  sequelize,
};
