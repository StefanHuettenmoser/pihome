import React, { useState, useCallback, useMemo } from "react";
import useResize from "../../hooks/useResize";

import useWidgets from "../../hooks/useWidgets";

import Widget from "./Widget";

const Dashboard = ({ columns = 4, rowHeight = 120, gap = 10 }) => {
	const [ref, width] = useResize();
	const [editMode, setEditMode] = useState(
		process.env.REACT_APP_ENV !== "production"
	);
	const [
		userWidgets,
		widgets,
		move,
		resize,
		setArguments,
		setWidgetID,
		addWidget,
		deleteWidget,
	] = useWidgets(columns);
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
					...(userWidgets || [1]).map(
						(userWidget) => userWidget.row + userWidget.height
					)
				) +
			2 * gap,
		[userWidgets, rowHeight, gap]
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
					userWidgets?.map((userWidget) => (
						<Widget
							key={`dashboard-widget-${userWidget._id}`}
							userWidget={userWidget}
							widgets={widgets}
							cellDimension={cellDimension}
							gap={gap}
							editMode={editMode}
							move={move}
							resize={resize}
							setArguments={setArguments}
							setWidgetID={setWidgetID}
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
