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
};

export default DataService;
