const config = require("../config/pihome.json");

// MYSQL CONNECTIONS POOL
// ================================================================================================
const mysql = require("mysql2");

const pool = mysql.createPool({
	host: "localhost",
	user: "root",
	password: config.db.password,
	database: config.db.database,
	connectionLimit: 10,
});

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

exports.getTableNames = () => {
	return new Promise((resolve, reject) => {
		const sql = "SHOW TABLES";
		pool.getConnection((err, connection) => {
			if (err) return reject(err);
			connection.query(sql, (err, results) => {
				connection.release();
				if (err) return reject(err);
				resolve(
					results.map((result) => {
						return result[`Tables_in_${config.db.database}`];
					})
				);
			});
		});
	});
};

exports.getTableData = (tableName) => {
	return new Promise((resolve, reject) => {
		const now = formatDate(
			new Date(Date.now() - 60 * 60 * 1000),
			SQL_DATE_FORMAT
		);
		const sql = `SELECT * FROM ?? WHERE Time >= '${now}'`;
		pool.getConnection((err, connection) => {
			if (err) return reject(err);
			connection.query(sql, [tableName], (err, results, fields) => {
				connection.release();
				if (err) return reject(err);
				resolve(results);
			});
		});
	});
};
