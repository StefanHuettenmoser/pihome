import { useState, useMemo, useEffect, useCallback, useContext } from "react";

import useREST from "./useREST";
import useServer from "./useServer";

import DashboardService from "../services/DashboardService";
import UserWidgetService from "../services/UserWidgetService";
import WidgetService from "../services/WidgetService";

export default function useWidgets(columns) {
	const [rawUserWidgets, _getOne, addOne, changeOne, deleteOne, update] =
		useREST(UserWidgetService);
	const [widgets] = useServer(WidgetService.getAll);
	console.log(rawUserWidgets);

	const fixPositions = useCallback(() => {
		rawUserWidgets.sort((a, b) => a.position - b.position);
		rawUserWidgets.forEach((rawUserWidget, i) => {
			if (rawUserWidget.position === i) return;
			console.warn("Found Widget with wrong position");
			rawUserWidget.position = i;
			changeOne(rawUserWidget._id, rawUserWidget);
		});
	}, [rawUserWidgets, changeOne]);

	const userWidgets = useMemo(() => {
		if (!rawUserWidgets) return;
		fixPositions();
		return DashboardService.calculateLayout(rawUserWidgets, columns);
	}, [columns, rawUserWidgets, fixPositions]);

	const move = useCallback(
		async (_id, step) => {
			console.log("Move", _id, step);
			if (Math.abs(step) !== 1) {
				console.warn(`Step size gt ${step} is not supported`);
				step = step ? 1 : -1;
			}
			const listIndex = rawUserWidgets.map((e) => e._id).indexOf(_id);

			const minorListIndex = Math.min(listIndex, listIndex + step);
			const majorListIndex = Math.max(listIndex, listIndex + step);
			if (minorListIndex < 0 || majorListIndex > rawUserWidgets.length) {
				console.warn("Should not be possible -> disable button");
				return;
			}

			const minorPosition = rawUserWidgets[minorListIndex].position;
			const majorPosition = rawUserWidgets[majorListIndex].position;

			const minorIndexWidget = rawUserWidgets[minorListIndex];
			minorIndexWidget.position = majorPosition;
			const majorIndexWidget = rawUserWidgets[majorListIndex];
			majorIndexWidget.position = minorPosition;

			await changeOne(minorIndexWidget._id, minorIndexWidget);
			await changeOne(majorIndexWidget._id, majorIndexWidget);
			await update();
		},
		[rawUserWidgets, changeOne, update]
	);

	const resize = useCallback(
		async (_id, width, height) => {
			console.log("Resize", _id, width, height);

			const listIndex = rawUserWidgets.map((e) => e._id).indexOf(_id);
			const changedWidget = rawUserWidgets[listIndex];
			changedWidget.height = height;
			changedWidget.width = width;
			await changeOne(changedWidget._id, changedWidget);
			await update();
		},
		[rawUserWidgets, changeOne, update]
	);
	const setWidgetID = useCallback(
		async (_id, widget_id) => {
			const listIndex = rawUserWidgets.map((e) => e._id).indexOf(_id);
			const changedWidget = rawUserWidgets[listIndex];
			changedWidget.widget_id = widget_id;
			await changeOne(changedWidget._id, changedWidget);
			await update();
		},
		[rawUserWidgets, changeOne, update]
	);

	const setArguments = useCallback(
		async (_id, args) => {
			const listIndex = rawUserWidgets.map((e) => e._id).indexOf(_id);
			console.log("Found @", listIndex);
			const changedWidget = rawUserWidgets[listIndex];
			console.log(changedWidget);
			changedWidget.args = { ...changedWidget.args, ...args };
			await changeOne(changedWidget._id, changedWidget);
			await update();
		},
		[rawUserWidgets, changeOne, update]
	);

	const addWidget = useCallback(async () => {
		// Math.max(...[]) => -Infinity
		// ---BUT---
		// Math.max(...[], 0) => 0
		const position = Math.max(...rawUserWidgets.map((e) => e.position), -1) + 1;
		const width = 1;
		const height = 1;
		const widget_id = 1;
		const args = { referenceTable: "", title: "New Widget" };
		await addOne({ position, width, height, widget_id, args });
		await update();
	}, [rawUserWidgets, addOne, update]);

	const deleteWidget = useCallback(
		async (_id) => {
			await deleteOne(_id);
			await update();
		},
		[deleteOne, update]
	);
	// TODO: REMOVE
	// TODO: ADD

	return [
		userWidgets,
		widgets,
		move,
		resize,
		setArguments,
		setWidgetID,
		addWidget,
		deleteWidget,
	];
}
