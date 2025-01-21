const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// const authRoutes = require("./routes/authRoutes");
const parkRoutes = require("./routes/parkRoutes");
const formRoutes = require("./routes/formRoutes");
const cityRoutes = require("./routes/cityRoutes");

// app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/parks", parkRoutes);

module.exports = app;
