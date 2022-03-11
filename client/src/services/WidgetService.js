import {
	authGET,
	authPOST,
	authPUT,
	authDELETE,
	handleFetch,
} from "./helpers/authFetch";

const __ROUTE = "widget/";
const UserWidgetService = {
	getAll: () => {
		return handleFetch("Get All Widgets", authGET(__ROUTE));
	},
};

export default UserWidgetService;
