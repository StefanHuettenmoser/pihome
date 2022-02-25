// LOAD CONFIG FILES
//
const config = require("../../config/pihome.json");
// LOAD SERVER MESSAGES
//
const errMsg = require("../messages/error");
const okMsg = require("../messages/success");

// GET DB
// ================================================================================================
const db = require("../database");

// IMPORT LIBRARIES
// ================================================================================================
const express = require("express");
const router = express.Router();

// ROUTES
// ================================================================================================

// GET ALL
// *******
//
router.get("/", async (req, res) => {
	try {
		data = await db.getTableNames();
		console.log(data);
		return res.status(200).json(data);
	} catch (err) {
		return res.status(500).errMsg(500);
	}
});

// CREATE NEW
// **********
//
router.post("/", (req, res) => {});

// GET ONE
// *******
//
router.get("/:id", async (req, res) => {});

// CHANGE ONE
// **********
//
router.put("/:id", async (req, res) => {});

// DELETE ONE
// ********
//
router.delete("/:id", async (req, res) => {});

// EXPORT
// ================================================================================================
module.exports = router;
