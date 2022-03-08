import React, { useState, useContext, useCallback, useEffect } from "react";

import Typography from "@mui/material/Typography";
import DashboardService from "../services/DashboardService";

import { DataContext } from "../context/DataContext";

import DataChart from "./charts/DataChart";
import useDebounce from "../hooks/useDebounce";

const Widget = ({
	widgetLayout,
	cellDimension,
	gap,
	editMode,
	move,
	resize,
	setArguments,
	deleteWidget,
	style = {},
	...props
}) => {
	const { tableNames, getData, subscribe, unsubscribe } =
		useContext(DataContext);
	const [newHeight, setNewHeight] = useState(widgetLayout.height);
	const [newWidth, setNewWidth] = useState(widgetLayout.width);
	const [newName, setNewName] = useState(widgetLayout.args.title);
	const debouncedNewName = useDebounce(newName, 300);
	useEffect(() => {
		setArguments(widgetLayout._id, { title: debouncedNewName });
	}, [debouncedNewName]);

	const handleSelect = useCallback(
		(tableName) => {
			console.log("handleSelect");
			setArguments(widgetLayout._id, { referenceTable: tableName });
		},
		[setArguments, widgetLayout._id]
	);
	useEffect(() => {
		subscribe(widgetLayout.args.referenceTable);
		return () => unsubscribe(widgetLayout.args.referenceTable);
	}, [widgetLayout.args.referenceTable]);

	return (
		<div
			style={{
				...style,
				...DashboardService.makeStyle(widgetLayout, cellDimension, gap),
				background: "white",
				padding: "0.5em",
				overflow: "hidden",
				borderRadius: "5px",
				transition:
					"all 0.7s ease-in-out, width 0.4s ease-in-out, height 0.4s ease-in-out",
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
				{!editMode ? (
					<Typography key={`${widgetLayout._id}-title`} variant="subtitle2">
						{widgetLayout.args.title}
					</Typography>
				) : (
					<>
						<input
							key={`${widgetLayout._id}-title-edit`}
							type="text"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
						/>
						{tableNames && (
							<select
								key={`widget-dropdown-${widgetLayout._id}`}
								onChange={(e) => handleSelect(e.target.value)}
								value={widgetLayout.args.referenceTable}
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
						<div key={`${widgetLayout._id}-delete-button-frame`}>
							<button
								key={`${widgetLayout._id}-delete-button`}
								style={{
									background: "red",
									padding: "0em 1em",
								}}
								onClick={() => deleteWidget(widgetLayout._id)}
							>
								Delete {widgetLayout._id}
							</button>
						</div>
					</>
				)}
				<DataChart
					data={getData(widgetLayout.args.referenceTable)}
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
