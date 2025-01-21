const sequelize = require("../db");

const City = require("./City");
const Park = require("./Park");
const Form = require("./Form");

Park.belongsTo(City, { foreignKey: "cityId", targetKey: "id" });
Form.belongsTo(Park, { foreignKey: "parkId", targetKey: "id" });

module.exports = {
  Park,
  City,
  Form,
  sequelize,
};
