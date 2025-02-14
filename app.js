const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const parkRoutes = require("./routes/parkRoutes");
const formRoutes = require("./routes/formRoutes");
const cityRoutes = require("./routes/cityRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const smsCodeRouter = require("./routes/smsCodeRouter");

app.use("/cities", cityRoutes);
app.use("/promotions", promotionRoutes);
app.use("/forms", formRoutes);
app.use("/parks", parkRoutes);
app.use("/smsCodes", smsCodeRouter);

module.exports = app;
