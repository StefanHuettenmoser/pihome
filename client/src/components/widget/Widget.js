import React, { useState, useContext, useCallback, useEffect } from "react";

import Typography from "@mui/material/Typography";
import DashboardService from "../../services/DashboardService";

import { DataContext } from "../../context/DataContext";

import DataChart from "../charts/DataChart";
import useDebounce from "../../hooks/useDebounce";
import EditBar from "./EditBar";

const Widget = ({
	widgets,
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
	const { tableNames, getData, subscribe, unsubscribe } =
		useContext(DataContext);

	const [name, setName] = useState(userWidget.args.title);
	const debouncedName = useDebounce(name, 300);

	const handleSelect = useCallback(
		(tableName) => {
			console.log("handleSelect");
			setArguments(userWidget._id, { referenceTable: tableName });
		},
		[setArguments, userWidget._id]
	);

	useEffect(() => {
		setArguments(userWidget._id, { title: debouncedName });
	}, [debouncedName]);
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
						{userWidget && (
							<EditBar
								userWidget={userWidget}
								widgets={widgets}
								move={move}
								resize={resize}
								deleteWidget={deleteWidget}
							/>
						)}
						<input
							key={`${userWidget._id}-title-edit`}
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						{tableNames && (
							<select
								key={`data-dropdown-${userWidget._id}`}
								onChange={(e) => handleSelect(e.target.value)}
								value={userWidget.args.referenceTable}
							>
								{tableNames.map((tableName) => (
									<option
										key={`data-dropdown-${userWidget._id}-element-${tableName}`}
									>
										{tableName}
									</option>
								))}
							</select>
						)}
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
