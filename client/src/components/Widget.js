import React, { useState, useContext, useCallback, useEffect } from "react";

import DashboardService from "../services/DashboardService";

import { DataContext } from "../context/DataContext";

import DataChart from "./charts/DataChart";

const Widget = ({
	widgetLayout,
	editMode,
	move,
	resize,
	setContent,
	style = {},
	...props
}) => {
	const { tableNames, getData } = useContext(DataContext);
	const [newHeight, setNewHeight] = useState(widgetLayout.height);
	const [newWidth, setNewWidth] = useState(widgetLayout.width);

	const handleSelect = useCallback(
		(tableName) => {
			console.log("handleSelect");
			setContent(widgetLayout._id, tableName);
		},
		[setContent, widgetLayout._id]
	);

	return (
		<div
			style={{
				...style,
				...DashboardService.makeStyle(widgetLayout),
				background: "lightgrey",
				padding: "0.5em",
				overflow: "hidden",
			}}
			{...props}
		>
			<div
				key={`widget-container-${widgetLayout._id}`}
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{editMode && (
					<>
						{tableNames && (
							<select
								key={`widget-dropdown-${widgetLayout._id}`}
								onChange={(e) => handleSelect(e.target.value)}
								value={widgetLayout.data}
							>
								{tableNames.map((tableName) => (
									<option key={`widget-dropdown-element-${tableName}`}>
										{tableName}
									</option>
								))}
							</select>
						)}
						<div style={{ display: "flex" }}>
							<button
								key={`${widgetLayout._id}-button-back`}
								onClick={() => move(widgetLayout._id, -1)}
							>
								&lt;
							</button>
							<span key={`${widgetLayout._id}-current-position`}>
								&nbsp;{widgetLayout.position}&nbsp;
							</span>
							<button
								key={`${widgetLayout._id}-button-forward`}
								onClick={() => move(widgetLayout._id, 1)}
							>
								&gt;
							</button>
							<label
								key={`${widgetLayout._id}-width-label`}
								htmlFor={`${widgetLayout._id}-width`}
							>
								w:
							</label>

							<input
								name={`${widgetLayout._id}-width`}
								key={`${widgetLayout._id}-width-input`}
								type="number"
								step="1"
								style={{ width: "4em" }}
								value={newWidth}
								min={1}
								onChange={(e) => setNewWidth(+e.target.value)}
							/>
							<label
								key={`${widgetLayout._id}-height-label`}
								htmlFor={`${widgetLayout._id}-height-input`}
							>
								h:
							</label>
							<input
								name={`${widgetLayout._id}-height`}
								key={`${widgetLayout._id}-height-input`}
								type="number"
								step="1"
								style={{ width: "4em" }}
								value={newHeight}
								min={1}
								onChange={(e) => setNewHeight(+e.target.value)}
							/>
							<button
								key={`${widgetLayout._id}-resize-button`}
								onClick={() => resize(widgetLayout._id, newWidth, newHeight)}
							>
								resize
							</button>
						</div>
					</>
				)}
				<DataChart
					data={getData(widgetLayout.data)}
					style={{
						height: "100%",
						width: "100%",
						background: "white",
						overflow: "hidden",
					}}
					key="Home-DataChart"
				/>
			</div>
		</div>
	);
};

export default Widget;
