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
const WIDGETS_TABLE_NAME = "$widgets";

// IMPORT LIBRARIES
// ================================================================================================
const express = require("express");
const router = express.Router();

// GET ALL
// *******
//
router.get("/", async (req, res) => {
	const sql = `SELECT * FROM ${WIDGETS_TABLE_NAME}`;
	try {
		const widgets = await db.handleRequest(sql);
		return res.status(200).json(widgets);
	} catch (err) {
		console.log(err);
		return res.status(500).json(errMsg(500));
	}
});

// CREATE NEW
// **********
//
// router.post("/", async (req, res) => {
//
// });

// GET ONE
// *******
//
// router.get("/:_id", async (req, res) => {
//
// });

// CHANGE ONE
// **********
//
// router.put("/:_id", async (req, res) => {
//
// });

// DELETE ONE
// ********
//
// router.delete("/:_id", async (req, res) => {
//
// });

// EXPORT
// ================================================================================================
module.exports = router;
