import React, { useState, useContext, useCallback, useEffect } from "react";

import Typography from "@mui/material/Typography";
import DashboardService from "../services/DashboardService";

import { DataContext } from "../context/DataContext";

import DataChart from "./charts/DataChart";
import useDebounce from "../hooks/useDebounce";

const Widget = ({
	userWidget,
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
	console.log(userWidget);
	const { tableNames, getData, subscribe, unsubscribe } =
		useContext(DataContext);
	const [newHeight, setNewHeight] = useState(userWidget.height);
	const [newWidth, setNewWidth] = useState(userWidget.width);
	const [newName, setNewName] = useState(userWidget.args.title);
	const debouncedNewName = useDebounce(newName, 300);
	useEffect(() => {
		setArguments(userWidget._id, { title: debouncedNewName });
	}, [debouncedNewName]);

	const handleSelect = useCallback(
		(tableName) => {
			console.log("handleSelect");
			setArguments(userWidget._id, { referenceTable: tableName });
		},
		[setArguments, userWidget._id]
	);
	useEffect(() => {
		subscribe(userWidget.args.referenceTable);
		return () => unsubscribe(userWidget.args.referenceTable);
	}, [userWidget.args.referenceTable]);

	return (
		<div
			style={{
				...style,
				...DashboardService.makeStyle(userWidget, cellDimension, gap),
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
				key={`widget-container-${userWidget._id}`}
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{!editMode ? (
					<Typography key={`${userWidget._id}-title`} variant="subtitle2">
						{userWidget.args.title}
					</Typography>
				) : (
					<>
						<input
							key={`${userWidget._id}-title-edit`}
							type="text"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
						/>
						{tableNames && (
							<select
								key={`widget-dropdown-${userWidget._id}`}
								onChange={(e) => handleSelect(e.target.value)}
								value={userWidget.args.referenceTable}
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
								key={`${userWidget._id}-button-back`}
								onClick={() => move(userWidget._id, -1)}
							>
								&lt;
							</button>
							<span key={`${userWidget._id}-current-position`}>
								&nbsp;{userWidget.position}&nbsp;
							</span>
							<button
								key={`${userWidget._id}-button-forward`}
								onClick={() => move(userWidget._id, 1)}
							>
								&gt;
							</button>
							<label
								key={`${userWidget._id}-width-label`}
								htmlFor={`${userWidget._id}-width`}
							>
								w:
							</label>

							<input
								name={`${userWidget._id}-width`}
								key={`${userWidget._id}-width-input`}
								type="number"
								step="1"
								style={{ width: "3.2em" }}
								value={newWidth}
								min={1}
								onChange={(e) => {
									const _newWidth = +e.target.value;
									setNewWidth(_newWidth);
									resize(userWidget._id, _newWidth, newHeight);
								}}
							/>
							<label
								key={`${userWidget._id}-height-label`}
								htmlFor={`${userWidget._id}-height-input`}
							>
								h:
							</label>
							<input
								name={`${userWidget._id}-height`}
								key={`${userWidget._id}-height-input`}
								type="number"
								step="1"
								style={{ width: "3.2em" }}
								value={newHeight}
								min={1}
								onChange={(e) => {
									const _newHeight = +e.target.value;
									setNewHeight(_newHeight);
									resize(userWidget._id, newWidth, _newHeight);
								}}
							/>
						</div>
						<div key={`${userWidget._id}-delete-button-frame`}>
							<button
								key={`${userWidget._id}-delete-button`}
								style={{
									background: "red",
									padding: "0em 1em",
								}}
								onClick={() => deleteWidget(userWidget._id)}
							>
								Delete {userWidget._id}
							</button>
						</div>
					</>
				)}
				<DataChart
					data={getData(userWidget.args.referenceTable)}
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
