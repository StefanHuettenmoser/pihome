const config = require("../config/pihome.json");

// MYSQL CONNECTIONS POOL
// ================================================================================================
const mysql = require("mysql2");

const pool = mysql.createPool({
	host: config.db.host,
	user: config.db.user,
	port: config.db.port || 3306,
	password: config.db.password,
	database: config.db.database,
	connectionLimit: 10,
});

const SYSTEM_PREFIX = "$";
const isSystem = (tableName) => tableName[0] === SYSTEM_PREFIX;
const isNotSystem = (tableName) => !isSystem(tableName);
const assertNotSystem = (tableName) => {
	if (isSystem(tableName)) {
		throw `WARNING: Invalid table name (${tableName}). Table name can not start with a ${SYSTEM_PREFIX}`;
	}
};
const SQL_DATE_FORMAT = "%Y-%m-%d %H:%M:%S";
const formatDate = (date, formatString, utc) => {
	utc = utc ? "getUTC" : "get";
	return formatString.replace(/%[YmdHMS]/g, function (m) {
		switch (m) {
			case "%Y":
				return date[utc + "FullYear"]();
			case "%m":
				m = 1 + date[utc + "Month"]();
				break;
			case "%d":
				m = date[utc + "Date"]();
				break;
			case "%H":
				m = date[utc + "Hours"]();
				break;
			case "%M":
				m = date[utc + "Minutes"]();
				break;
			case "%S":
				m = date[utc + "Seconds"]();
				break;
			default:
				return m.slice(1);
		}
		// add leading zeros
		return ("0" + m).slice(-2);
	});
};
exports.formatDate = (date) => {
	return formatDate(date, SQL_DATE_FORMAT);
};

const handleRequest = (sql, values, wrap) => {
	console.log("Handle", sql, values);
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) return reject(err);
			connection.query(sql, values, (err, results) => {
				connection.release();
				if (err) return reject(err);
				resolve(wrap ? wrap(results) : results);
			});
		});
	});
};

exports.getTableNames = (system) => {
	const sql = "SHOW TABLES";
	return handleRequest(sql, undefined, (results) => {
		results = results.map(
			(result) => result[`Tables_in_${config.db.database}`]
		);
		if (!system) {
			results = results.filter(isNotSystem);
		}
		return results;
	});
};

exports.getTableData = (tableName, where, system) => {
	if (!system) {
		assertNotSystem(tableName);
	}
	let sql = `SELECT * FROM ??`;
	if (where) {
		sql += where;
	}
	return handleRequest(sql, [tableName]);
};

exports.addTableData = (tableName, rowNames, values, system) => {
	if (!system) {
		assertNotSystem(tableName);
	}
	const sql = `INSERT INTO ?? (${rowNames.join(", ")}) VALUES (?)`;
	return handleRequest(sql, [tableName, values]);
};
exports.updateTableData = (tableName, values, compare_value, system) => {
	if (!system) {
		assertNotSystem(tableName);
	}
	const sql = `UPDATE ?? SET ? WHERE ${compare_value}`;
	return handleRequest(sql, [tableName, values]);
};

exports.deleteTableData = (tableName, compare_value, system) => {
	if (!system) {
		assertNotSystem(tableName);
	}
	const sql = `DELETE FROM ?? WHERE ${compare_value}`;
	return handleRequest(sql, [tableName]);
};

exports.createTable = (tableName, rowDefinitions, system) => {
	if (!system) {
		assertNotSystem(tableName);
	}
	const sql = `CREATE TABLE if not exists ?? (${rowDefinitions.join(", ")})`;
	return handleRequest(sql, [tableName, rowDefinitions]);
};

exports.deleteTable = (tableName) => {
	if (!system) {
		assertNotSystem(tableName);
	}
	const sql = "DROP TABLE ??";
	return handleRequest(sql, [tableName]);
};

exports.handleRequest = handleRequest;
