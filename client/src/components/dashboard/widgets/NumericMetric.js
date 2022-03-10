import React from "react";

import TitleWidgetWrapper from "./wrapper/Title";
import DataWidgetWrapper from "./wrapper/Data";

const NumericMetric = ({ data }) => {
	const dataPoint = data[0].Value;

	return <> Value: {dataPoint} </>;
};

const NumericMetricWrapper = ({ userWidget, setArguments, editMode }) => {
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
				<NumericMetric />
			</DataWidgetWrapper>
		</TitleWidgetWrapper>
	);
};

export default NumericMetricWrapper;
