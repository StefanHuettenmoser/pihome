import {
	authGET,
	authPOST,
	SERVER_API,
	handleFetch,
} from "./helpers/authFetch";

const DataService = {
	getTableNames: () => {
		return handleFetch("getTableNames", authGET("data"));
	},
	getTableData: (table_name, start_date, end_date) => {
		return handleFetch(
			`getTableData (${table_name})`,
			authGET(`data/${table_name}`)
		);
	},
};

export default DataService;
