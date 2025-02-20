const app = require("./app");
const sequelize = require("./db");
const initializeData = require("./initData");

const PORT = 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    await initializeData();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
