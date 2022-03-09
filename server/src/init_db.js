// GET DB
// ================================================================================================
const db = require("./database");
const USERS_TABLE_NAME = "$users";
const WIDGETS_TABLE_NAME = "$widgets";
const USER_WIDGETS_TABLE_NAME = "$user_widgets";

const initDB = async () => {
	console.log("INIT DBs");
	try {
		await db.createTable(
			USERS_TABLE_NAME,
			[
				"_id int primary key auto_increment",
				"username nvarchar(50) NOT NULL UNIQUE",
			],
			true
		);
		await db.createTable(
			WIDGETS_TABLE_NAME,
			["_id int primary key auto_increment", "widget_name nvarchar(50) UNIQUE"],
			true
		);
		await db.createTable(
			USER_WIDGETS_TABLE_NAME,
			[
				"_id int primary key auto_increment",
				"user_id int",
				"widget_id int",
				"width tinyint",
				"height tinyint",
				"position tinyint",
				"args nvarchar(4000)",
				`FOREIGN KEY(user_id) REFERENCES ${USERS_TABLE_NAME}(_id) ON DELETE SET NULL`,
				`FOREIGN KEY(widget_id) REFERENCES ${WIDGETS_TABLE_NAME}(_id) ON DELETE SET NULL`,
			],
			true
		);
		// CREATE ADMIN IF NOT EXISTS
		await db.handleRequest(
			`INSERT INTO ${USERS_TABLE_NAME} (username) SELECT 'admin' WHERE NOT EXISTS(SELECT * FROM ${USERS_TABLE_NAME} WHERE _id=1);`
		);
		// CREATE WIDGETS IF NOT EXISTS
		await db.handleRequest(
			`INSERT INTO ${WIDGETS_TABLE_NAME} (widget_name) SELECT 'LineChart' WHERE NOT EXISTS(SELECT * FROM ${WIDGETS_TABLE_NAME} WHERE _id=1);`
		);
		await db.handleRequest(
			`INSERT INTO ${WIDGETS_TABLE_NAME} (widget_name) SELECT 'NumericMetric' WHERE NOT EXISTS(SELECT * FROM ${WIDGETS_TABLE_NAME} WHERE _id=2);`
		);
		// TODO: add
		///// Dashboard Widgets
		// (https://www.fusioo.com/guide/dashboard-widgets)

		// Widgets are the core components that make up a Dashboard. They help you visualize and summarize the data stored in your Apps.
		// There are different types of widgets which can be added to a Dashboard:

		// Heading
		// The Heading widget is used to organize your Dashboard. It can be used to divide the Dashboard in sections making it easier to view important information at a glance. Learn more.

		// Text Widget
		// The Text widget lets you write rich text notes that provide additional context to your Apps. You can add text, links, images and even embedded videos to your Dashboards.

		// List & Kanban View
		// This widget lets you interact with your data. You can view, edit, delete and create records from within this widget. There are different views which can be used to visualize the data.

		// Numeric Metric
		// The Numeric Metric helps you visualize and keep track of key App metrics

		// Sorted List
		// The Sorted List Widget helps you visualize a top/bottom 10 record list. Records can be sorted by a Number or a Date Field.

		// Pie Chart
		// The Pie Chart helps you proportionally compare different data categories.

		// Line Chart
		// The Line Chart helps you visualize a trend in data over intervals of time.

		// Bar Chart
		// The Bar Chart is used to display and compare different categories of data.
	} catch (err) {
		console.error(err);
	}
};
module.exports = initDB;
