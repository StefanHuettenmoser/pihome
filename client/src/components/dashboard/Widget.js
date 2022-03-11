import React, { useState, useEffect, useMemo } from "react";

import DashboardService from "../../services/DashboardService";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import EditBar from "./EditBar";
import NumericMetric from "./widgets/NumericMetric";
import LineChart from "./widgets/LineChart";

import Select from "../Select";

const widgetSwitch = {
	NumericMetric,
	LineChart,
};

const Widget = ({
	widgets,
	userWidget,
	cellDimension,
	gap,
	editMode,
	move,
	resize,
	setArguments,
	setWidgetID,
	deleteWidget,
	style = {},
	...props
}) => {
	const [selectedWidgetID, setSelectedWidgetID] = useState(
		userWidget.widget_id
	);
	const widgetName = widgets?.filter(
		(widget) => widget._id === userWidget.widget_id
	)[0]?.widget_name;
	const WidgetContent = useMemo(() => widgetSwitch[widgetName], [widgetName]);
	useEffect(() => {
		if (userWidget.widget_id !== +selectedWidgetID) {
			setWidgetID(userWidget._id, selectedWidgetID);
		}
	}, [selectedWidgetID, userWidget._id, userWidget.widget_id, setWidgetID]);

	return (
		<Card
			sx={{
				...style,
				...DashboardService.makeStyle(userWidget, cellDimension, gap),
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				transition:
					"all 0.5s ease-in-out, width 0.4s ease-in-out, height 0.4s ease-in-out",
			}}
			{...props}
		>
			{widgets && editMode && (
				<Select
					name="SelectWidget"
					data={widgets}
					label="Widget Type"
					getValue={(d) => d._id}
					getName={(d) => d.widget_name}
					value={selectedWidgetID}
					onChange={(e) => setSelectedWidgetID(e.target.value)}
					fullWidth
					variant="standard"
				/>
			)}
			<CardContent
				key={`widget-container-${userWidget._id}`}
				style={{
					height: 0,
					flexGrow: 1,
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{WidgetContent && (
					<WidgetContent
						key={`Widget-${userWidget._id}`}
						userWidget={userWidget}
						setArguments={setArguments}
						editMode={editMode}
					/>
				)}
			</CardContent>
			{editMode && userWidget && (
				<EditBar
					userWidget={userWidget}
					move={move}
					resize={resize}
					deleteWidget={deleteWidget}
				/>
			)}
		</Card>
	);
};

export default Widget;
