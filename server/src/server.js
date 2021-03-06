// INITIALIZE
// ================================================================================================
require("./init_db")();

const express = require("express");
const app = express();

// General middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES
// ================================================================================================
// load all routes form the routes folder
const dataRouter = require("./routes/data");
app.use("/api/v1/data", dataRouter);
const userWidgetRouter = require("./routes/user_widget");
app.use("/api/v1/user_widget", userWidgetRouter);
const widgetRouter = require("./routes/widget");
app.use("/api/v1/widget", widgetRouter);

// not found route
app.get("/api", (req, res) => res.send("Pihome Backend Server API"));
app.get("*", (req, res) => res.status(404).json({ error: "Not Found" }));

module.exports = app;
