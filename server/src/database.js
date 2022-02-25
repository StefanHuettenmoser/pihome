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
		const sql = "SELECT * FROM ??";
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
