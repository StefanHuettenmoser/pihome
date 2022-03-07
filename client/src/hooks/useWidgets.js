import { useState, useMemo, useEffect, useCallback, useContext } from "react";

import useREST from "./useREST";

import DashboardService from "../services/DashboardService";
import WidgetService from "../services/WidgetService";

export default function useWidgets(columns) {
	const [widgetsConfig, _getOne, addOne, changeOne, deleteOne, update] =
		useREST(WidgetService);

	const widgetLayouts = useMemo(() => {
		if (!widgetsConfig) return;
		return DashboardService.calculateLayout(widgetsConfig, columns);
	}, [columns, widgetsConfig]);

	const move = useCallback(
		async (_id, step) => {
			console.log("Move", _id, step);
			if (Math.abs(step) > 1) {
				console.warn(`Step size gt ${step} is not supported`);
			}
			const listIndex = widgetsConfig.map((e) => e._id).indexOf(_id);

			const minorListIndex = Math.min(listIndex, listIndex + step);
			const majorListIndex = Math.max(listIndex, listIndex + step);
			if (minorListIndex < 0 || majorListIndex > widgetsConfig.length) {
				console.warn("Should not be possible -> disable button");
				return;
			}

			const minorPosition = widgetsConfig[minorListIndex].position;
			const majorPosition = widgetsConfig[majorListIndex].position;

			const minorIndexWidget = widgetsConfig[minorListIndex];
			minorIndexWidget.position = majorPosition;
			const majorIndexWidget = widgetsConfig[majorListIndex];
			majorIndexWidget.position = minorPosition;

			await changeOne(minorIndexWidget._id, minorIndexWidget);
			await changeOne(majorIndexWidget._id, majorIndexWidget);
			await update();
		},
		[widgetsConfig, changeOne, update]
	);

	const resize = useCallback(
		async (_id, width, height) => {
			console.log("Resize", _id, width, height);

			const listIndex = widgetsConfig.map((e) => e._id).indexOf(_id);
			const changedWidget = widgetsConfig[listIndex];
			changedWidget.height = height;
			changedWidget.width = width;
			await changeOne(changedWidget._id, changedWidget);
			await update();
		},
		[widgetsConfig, changeOne, update]
	);

	const setArguments = useCallback(
		async (_id, args) => {
			const listIndex = widgetsConfig.map((e) => e._id).indexOf(_id);
			console.log("Found @", listIndex);
			const changedWidget = widgetsConfig[listIndex];
			console.log(changedWidget);
			changedWidget.args = { ...changedWidget.args, ...args };
			await changeOne(changedWidget._id, changedWidget);
			await update();
		},
		[widgetsConfig, changeOne, update]
	);

	const addWidget = useCallback(async () => {
		const position = Math.max(...widgetsConfig.map((e) => e.position)) + 1;
		const width = 1;
		const height = 1;
		const widget_id = 1;
		const args = { referenceTable: "", title: "New Widget" };
		await addOne({ position, width, height, widget_id, args });
		await update();
	}, [widgetsConfig, addOne, update]);

	const deleteWidget = useCallback(
		async (_id) => {
			await deleteOne(_id);
			await update();
		},
		[deleteOne, update]
	);
	// TODO: REMOVE
	// TODO: ADD

	return [widgetLayouts, move, resize, setArguments, addWidget, deleteWidget];
}
