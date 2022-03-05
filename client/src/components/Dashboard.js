import React, { useState, useCallback, useMemo } from "react";

import Container from "@mui/material/Container";

import useWidgets from "../hooks/useWidgets";

import Widget from "./Widget";

import widgetsConfig from "../test_data/widgetsConfig";

const Dashboard = ({ columns = 4, rowHeight = 120, gap = 10 }) => {
	const [editMode, setEditMode] = useState(false);
	const [widgetLayouts, move, resize, setArguments] = useWidgets(
		widgetsConfig,
		columns
	);
	const handleEditModeChange = useCallback(
		(e) => {
			setEditMode(e.target.checked);
		},
		[setEditMode]
	);

	return (
		<>
			<div
				key="dashboardGrid"
				style={{
					display: "grid",
					gridGap: `${gap}px`,
					gridTemplateColumns: `repeat(${columns}, 1fr)`,
					gridAutoRows: `${rowHeight}px`,
					paddingBottom: "1em",
				}}
			>
				{widgetLayouts?.map((widgetLayout) => (
					<Widget
						key={`dashboard-widget-${widgetLayout._id}`}
						widgetLayout={widgetLayout}
						editMode={editMode}
						move={move}
						resize={resize}
						setArguments={setArguments}
					/>
				))}
			</div>
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
