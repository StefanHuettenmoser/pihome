const DashboardService = {
	calculateLayout: (rawUserWidgets, n_columns) => {
		const gridArray = [];
		const userWidgets = [];
		rawUserWidgets.sort((a, b) => a.position - b.position);
		rawUserWidgets.forEach((rawUserWidget) => {
			userWidgets.push({
				...rawUserWidget,
				...getWidgetPlacement(rawUserWidget, gridArray, n_columns),
			});
		});
		userWidgets.sort((a, b) => a._id - b._id);
		return userWidgets;
	},
	makeStyle: (userWidget, cellDimension, gap) => {
		const { row, column, height, width } = userWidget;
		return {
			position: "absolute",
			width: `${width * cellDimension.width - gap}px`,
			height: `${height * cellDimension.height - gap}px`,
			left: `${column * cellDimension.width + gap / 2}px`,
			top: `${row * cellDimension.height + gap / 2}px`,
			margin: `${gap / 2}px`,
		};
	},
};

const getWidgetPlacement = (rawUserWidget, gridArray, n_columns) => {
	const widgetPlacement = findPlace(rawUserWidget, gridArray);
	// IF found placement: occupy place and return placement
	if (widgetPlacement) {
		occupyPlace(widgetPlacement, gridArray);
		return widgetPlacement;
	}
	// ELSE add row and try again
	gridArray.push(Array(n_columns).fill(true));
	return getWidgetPlacement(rawUserWidget, gridArray, n_columns);
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
