const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const parkRoutes = require("./routes/parkRoutes");
const formRoutes = require("./routes/formRoutes");
const cityRoutes = require("./routes/cityRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const smsCodeRouter = require("./routes/smsCodeRouter");
const promotionRoutes = require("./routes/promotionRoutes");

app.use("/users", authRoutes);
app.use("/reviews", reviewRoutes);
app.use("/banners", bannerRoutes);
app.use("/cities", cityRoutes);
app.use("/promotions", promotionRoutes);
app.use("/forms", formRoutes);
app.use("/parks", parkRoutes);
app.use("/smsCodes", smsCodeRouter);

module.exports = app;
