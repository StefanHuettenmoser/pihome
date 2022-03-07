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
		return res.status(200).json(data);
	} catch (err) {
		return res.status(500).json(errMsg(500));
	}
});

// CREATE NEW
// **********
//
router.post("/", (req, res) => {});

// GET ONE
// *******
//
router.get("/:tableName", async (req, res) => {
	const BASE_DURATION = 60 * 60 * 1000;
	const from = db.formatDate(new Date(Date.now() - BASE_DURATION));
	const where = ` WHERE Time >= '${from}'`;
	try {
		data = await db.getTableData(req.params.tableName, where);
		return res.status(200).json(data);
	} catch (err) {
		if (err.code === "ER_NO_SUCH_TABLE") {
			console.log(`No table called ${req.params.tableName}`);
		} else {
			console.log(err);
		}
		return res.status(500).json(errMsg(500));
	}
});

// CHANGE ONE
// **********
//
router.put("/:_id", async (req, res) => {});

// DELETE ONE
// ********
//
router.delete("/:_id", async (req, res) => {});

// EXPORT
// ================================================================================================
module.exports = router;
