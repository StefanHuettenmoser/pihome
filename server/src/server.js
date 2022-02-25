// INITIALIZE
// ================================================================================================

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

// not found route
app.get("/api", (req, res) => res.send("Pihome Backend Server API"));
app.get("*", (req, res) => res.status(404).json({ error: "Not Found" }));

module.exports = app;
