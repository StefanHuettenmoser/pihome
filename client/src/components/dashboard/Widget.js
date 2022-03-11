import React, { useState, useEffect, useMemo } from "react";

import DashboardService from "../../services/DashboardService";

import EditBar from "./EditBar";
import NumericMetric from "./widgets/NumericMetric";
import LineChart from "./widgets/LineChart";

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
				{editMode && userWidget && (
					<EditBar
						userWidget={userWidget}
						widgets={widgets}
						move={move}
						resize={resize}
						deleteWidget={deleteWidget}
						selectedWidgetID={selectedWidgetID}
						setSelectedWidgetID={setSelectedWidgetID}
					/>
				)}
				{WidgetContent && (
					<WidgetContent
						key={`Widget-${userWidget._id}`}
						userWidget={userWidget}
						setArguments={setArguments}
						editMode={editMode}
					/>
				)}
			</div>
		</div>
	);
};

export default Widget;
