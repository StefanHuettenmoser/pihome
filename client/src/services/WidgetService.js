import {
	authGET,
	authPOST,
	authPUT,
	authDELETE,
	handleFetch,
} from "./helpers/authFetch";

const __ROUTE = "widget/";
const WidgetService = {
	getAll: () => {
		return handleFetch("Get All Widgets", authGET(__ROUTE));
	},
	addOne: ({ width, height, position, widget_id, args }) => {
		return handleFetch(
			"Add Widget",
			authPOST(__ROUTE, { width, height, position, widget_id, args })
		);
	},
	changeOne: (_id, { width, height, position, widget_id, args }) => {
		return handleFetch(
			`Change Widget ${_id}`,
			authPUT(__ROUTE + _id, { width, height, position, widget_id, args })
		);
	},
	deleteOne: (_id) => {
		return handleFetch(`Delete Widget ${_id}`, authDELETE(__ROUTE + _id));
	},
};

export default WidgetService;
