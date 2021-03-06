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
const mysql = require("mysql2");
const USER_WIDGETS_TABLE_NAME = "$user_widgets";

// IMPORT LIBRARIES
// ================================================================================================
const express = require("express");
const router = express.Router();

const _user_id = 1;

// ROUTES
// ================================================================================================

// GET ALL
// *******
//
router.get("/", async (req, res) => {
	const sql =
		`SELECT ${USER_WIDGETS_TABLE_NAME}._id, ${USER_WIDGETS_TABLE_NAME}.width, ${USER_WIDGETS_TABLE_NAME}.height, ${USER_WIDGETS_TABLE_NAME}.position, ${USER_WIDGETS_TABLE_NAME}.args, ${USER_WIDGETS_TABLE_NAME}.widget_id\n` +
		`FROM ${USER_WIDGETS_TABLE_NAME} \n` +
		`WHERE user_id = ? \n`;
	try {
		const user_widgets = await db.handleRequest(sql, [_user_id]);
		return res.status(200).json(
			user_widgets.map((user_widget) => {
				user_widget.args = JSON.parse(user_widget.args);
				return user_widget;
			})
		);
	} catch (err) {
		console.log(err);
		return res.status(500).json(errMsg(500));
	}
});

// CREATE NEW
// **********
//
router.post("/", async (req, res) => {
	const { width, height, position, args, widget_id } = req.body;
	try {
		const result = await db.addTableData(
			USER_WIDGETS_TABLE_NAME,
			["user_id", "widget_id", "width", "height", "position", "args"],
			[_user_id, widget_id, width, height, position, JSON.stringify(args)],
			true
		);
		return res.status(201).json(result);
	} catch (err) {
		console.log(err);
		return res.status(500).json(errMsg(500));
	}
});

// GET ONE
// *******
//
router.get("/:_id", async (req, res) => {
	try {
		return res.status(501).json(errMsg(501));
	} catch (err) {
		return res.status(500).json(errMsg(500));
	}
});

// CHANGE ONE
// **********
//
router.put("/:_id", async (req, res) => {
	const { _id } = req.params;
	const { width, height, position, args, widget_id } = req.body;
	console.log("CHANGE WIDGET", _id, req.body);
	console.log(req.body);
	try {
		const result = await db.updateTableData(
			USER_WIDGETS_TABLE_NAME,
			{
				widget_id,
				width,
				height,
				position,
				args: JSON.stringify(args),
			},
			`_id = ${mysql.escape(_id)} AND user_id = ${mysql.escape(_user_id)}`,
			true
		);
		return res.status(200).json(result);
	} catch (err) {
		console.log(err);
		return res.status(500).json(errMsg(500));
	}
});

// DELETE ONE
// ********
//
router.delete("/:_id", async (req, res) => {
	const { _id } = req.params;
	console.log("DELETE", _id);
	try {
		const result = await db.deleteTableData(
			USER_WIDGETS_TABLE_NAME,
			`_id = ${mysql.escape(_id)}`,
			true
		);
		return res.status(201).json(result);
	} catch (err) {
		console.log(err);
		return res.status(500).json(errMsg(500));
	}
});

// EXPORT
// ================================================================================================
module.exports = router;
