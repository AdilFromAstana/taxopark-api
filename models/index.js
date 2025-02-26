const sequelize = require("../db");

const City = require("./City");
const Park = require("./Park");
const Form = require("./Form");
const Promotion = require("./Promotion");
const FormStatus = require("./FormStatus");
const FormStatusHistory = require("./FormStatusHistory");
const FormStatusTransition = require("./FormStatusTransition");

Park.hasMany(Promotion, { foreignKey: "parkId" });
Promotion.belongsTo(Park, { foreignKey: "parkId" });

// Связь "Многие ко многим" для Park и City через cityIds
Park.belongsToMany(City, {
  through: "ParkCities", // Промежуточная таблица
  foreignKey: "parkId",
  otherKey: "cityId",
  as: "Cities",
});

City.belongsToMany(Park, {
  through: "ParkCities",
  foreignKey: "cityId",
  otherKey: "parkId",
  as: "Parks",
});

Park.belongsTo(City, { foreignKey: "cityId", targetKey: "id" });
Form.belongsTo(Park, { foreignKey: "parkId", targetKey: "id" });

FormStatusHistory.belongsTo(Form, { foreignKey: "formId", targetKey: "id" });
FormStatusHistory.belongsTo(FormStatus, {
  foreignKey: "newStatusCode",
  targetKey: "code",
  as: "statusDetail",
});

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
  sequelize,
};
