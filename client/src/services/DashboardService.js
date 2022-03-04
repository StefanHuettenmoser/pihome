const DashboardService = {
	calculateLayout: (widgetsConfig, n_columns) => {
		const gridArray = [];
		const widgetLayouts = [];
		widgetsConfig.sort((a, b) => a.position - b.position);
		widgetsConfig.forEach((widgetConfig) => {
			widgetLayouts.push({
				...widgetConfig,
				...getWidgetPlacement(widgetConfig, gridArray, n_columns),
			});
		});
		return widgetLayouts;
	},
	makeStyle: (widgetLayout) => {
		const { row, column, height, width } = widgetLayout;
		return {
			gridRow: `${row + 1} / ${row + height + 1}`,
			gridColumn: `${column + 1} / ${column + width + 1}`,
		};
	},
};

const getWidgetPlacement = (widgetConfig, gridArray, n_columns) => {
	const widgetPlacement = findPlace(widgetConfig, gridArray);
	// IF found placement: occupy place and return placement
	if (widgetPlacement) {
		occupyPlace(widgetPlacement, gridArray);
		return widgetPlacement;
	}
	// ELSE add row and try again
	gridArray.push(Array(n_columns).fill(true));
	return getWidgetPlacement(widgetConfig, gridArray, n_columns);
};

const findPlace = ({ width, height }, gridArray) => {
	if (gridArray.length === 0) return;
	width = Math.min(width, gridArray[0].length);
	let place = undefined;
	// check every element of the grid array
	gridArray.forEach((row, i) => {
		if (place) return;
		if (i + height > gridArray.length) return;

		row.forEach((cell, j) => {
			if (place) return;
			if (!cell) return;
			if (j + width > gridArray[0].length) return;
			const frame = gridArray
				.slice(i, i + height)
				.map((a) => a.slice(j, j + width));
			// check if every cell is true -> not occupied
			if (frame.every((row) => row.every((cell) => cell))) {
				place = { row: i, column: j, height, width };
			}
		});
	});
	return place;
};
const occupyPlace = ({ row, column, height, width }, gridArray) => {
	for (let i = row; i < row + height; i++) {
		for (let j = column; j < column + width; j++) {
			gridArray[i][j] = false;
		}
	}
};

export default DashboardService;
