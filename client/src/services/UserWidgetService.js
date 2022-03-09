import {
	authGET,
	authPOST,
	authPUT,
	authDELETE,
	handleFetch,
} from "./helpers/authFetch";

const __ROUTE = "user_widget/";
const UserWidgetService = {
	getAll: () => {
		return handleFetch("Get All User Widgets", authGET(__ROUTE));
	},
	addOne: ({ width, height, position, widget_id, args }) => {
		return handleFetch(
			"Add User Widget",
			authPOST(__ROUTE, { width, height, position, widget_id, args })
		);
	},
	changeOne: (_id, { width, height, position, widget_id, args }) => {
		return handleFetch(
			`Change User Widget ${_id}`,
			authPUT(__ROUTE + _id, { width, height, position, widget_id, args })
		);
	},
	deleteOne: (_id) => {
		return handleFetch(`Delete User Widget ${_id}`, authDELETE(__ROUTE + _id));
	},
};

export default UserWidgetService;
