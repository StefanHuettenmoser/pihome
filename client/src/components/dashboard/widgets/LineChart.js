import React from "react";

import TitleWidgetWrapper from "./wrapper/Title";
import DataWidgetWrapper from "./wrapper/Data";
import DataChart from "../../charts/DataChart";

const LineChart = ({ data }) => {
	return (
		<DataChart
			data={data}
			style={{
				height: "100%",
				width: "100%",
				background: "white",
				overflow: "hidden",
			}}
			key="Home-DataChart"
		/>
	);
};

const LineChartWrapper = ({ userWidget, setArguments, editMode }) => {
	return (
		<TitleWidgetWrapper
			key={`Widget-LineChart-${userWidget._id}-title-wrapper`}
			userWidget={userWidget}
			setArguments={setArguments}
			editMode={editMode}
		>
			<DataWidgetWrapper
				key={`Widget-LineChart-${userWidget._id}-data-wrapper`}
			>
				<LineChart />
			</DataWidgetWrapper>
		</TitleWidgetWrapper>
	);
};

export default LineChartWrapper;
