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
		<DataWidgetWrapper
			key={`Widget-LineChart-${userWidget._id}-data-wrapper`}
			userWidget={userWidget}
			setArguments={setArguments}
			editMode={editMode}
			multiple
		>
			<TitleWidgetWrapper
				key={`Widget-LineChart-${userWidget._id}-title-wrapper`}
			>
				<LineChart />
			</TitleWidgetWrapper>
		</DataWidgetWrapper>
	);
};

export default LineChartWrapper;
