import React, { useState, useCallback, useMemo } from "react";
import useResize from "../hooks/useResize";

import useWidgets from "../hooks/useWidgets";

import Widget from "./Widget";

const Dashboard = ({ columns = 4, rowHeight = 120, gap = 10 }) => {
	const [ref, width] = useResize();
	const [editMode, setEditMode] = useState(false);
	const [widgetLayouts, move, resize, setArguments, addWidget, deleteWidget] =
		useWidgets(columns);
	const handleEditModeChange = useCallback(
		(e) => {
			setEditMode(e.target.checked);
		},
		[setEditMode]
	);
	const cellDimension = useMemo(() => {
		return { width: width / columns, height: rowHeight };
	}, [width, columns, rowHeight]);

	const height = useMemo(
		() =>
			rowHeight *
				Math.max(
					...(widgetLayouts || [1]).map(
						(widgetLayout) => widgetLayout.row + widgetLayout.height
					)
				) +
			2 * gap,
		[widgetLayouts, rowHeight]
	);

	return (
		<>
			<div
				key="dashboardGrid"
				style={{
					display: "grid",
					paddingBottom: "1em",
					position: "relative",
					height: `${height}px`,
				}}
				ref={ref}
			>
				{cellDimension &&
					widgetLayouts?.map((widgetLayout) => (
						<Widget
							key={`dashboard-widget-${widgetLayout._id}`}
							widgetLayout={widgetLayout}
							cellDimension={cellDimension}
							gap={gap}
							editMode={editMode}
							move={move}
							resize={resize}
							setArguments={setArguments}
							deleteWidget={deleteWidget}
						/>
					))}
			</div>
			<button onClick={addWidget}>Add One</button>
			<input
				key="select-dashboard-mode"
				type="checkbox"
				name="select-dashboard-mode"
				onChange={handleEditModeChange}
				checked={editMode}
			/>
			<label key="select-dashboard-mode-label" htmlFor="select-dashboard-mode">
				edit-mode
			</label>
		</>
	);
};

export default Dashboard;
