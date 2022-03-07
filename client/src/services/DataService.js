import { authGET, handleFetch } from "./helpers/authFetch";

const DataService = {
	getTableNames: () => {
		return handleFetch("getTableNames", authGET("data"));
	},
	getTableData: (table_name, start_date, end_date) => {
		// TODO: Implement start_data and end_date
		return handleFetch(
			`getTableData (${table_name})`,
			authGET(`data/${table_name}`)
		);
	},
};

export default DataService;
