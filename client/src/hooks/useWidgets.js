import { useState, useMemo, useEffect, useCallback, useContext } from "react";

import DashboardService from "../services/DashboardService";
import { DataContext } from "../context/DataContext";

const sortByPosition = (list) => {
	list.sort((a, b) => a.position - b.position);
};

export default function useWidgets(initWidgetsConfig, columns) {
	const { subscribe, unsubscribe } = useContext(DataContext);

	useEffect(() => {
		initWidgetsConfig.forEach(({ data }) => {
			subscribe(data);
		});
	}, []);
	const [widgetsConfig, setWidgetsConfig] = useState(() => {
		sortByPosition(initWidgetsConfig);
		return initWidgetsConfig;
	});
	console.log(widgetsConfig);

	const widgetLayouts = useMemo(() => {
		return DashboardService.calculateLayout(widgetsConfig, columns);
	}, [columns, widgetsConfig]);
	console.log(widgetLayouts);

	const move = useCallback(
		(_id, step) => {
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

			setWidgetsConfig((prev) => {
				const changedWidgetsConfig = [
					...prev.slice(0, minorListIndex),
					minorIndexWidget,
					majorIndexWidget,
					...prev.slice(majorListIndex + 1),
				];
				sortByPosition(changedWidgetsConfig);
				return changedWidgetsConfig;
			});
		},
		[widgetsConfig, setWidgetsConfig]
	);

	const resize = useCallback(
		(_id, width, height) => {
			console.log("Resize", _id, width, height);

			const listIndex = widgetsConfig.map((e) => e._id).indexOf(_id);
			const changedWidget = widgetsConfig[listIndex];
			changedWidget.height = height;
			changedWidget.width = width;
			setWidgetsConfig((prev) => [
				...prev.slice(0, listIndex),
				changedWidget,
				...prev.slice(listIndex + 1),
			]);
		},
		[widgetsConfig, setWidgetsConfig]
	);

	const setContent = useCallback(
		(_id, data) => {
			console.log("Set Content", _id, data);

			const listIndex = widgetsConfig.map((e) => e._id).indexOf(_id);
			console.log("Found @", listIndex);
			const changedWidget = widgetsConfig[listIndex];
			console.log(changedWidget);
			unsubscribe(changedWidget.data);
			changedWidget.data = data;
			subscribe(changedWidget.data);
			setWidgetsConfig((prev) => [
				...prev.slice(0, listIndex),
				changedWidget,
				...prev.slice(listIndex + 1),
			]);
		},
		[widgetsConfig, setWidgetsConfig]
	);

	// TODO: REMOVE
	// TODO: ADD

	return [widgetLayouts, move, resize, setContent];
}
