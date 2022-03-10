import React from "react";

import { linearRegression } from "../../../services/helpers/stats";

import Typography from "@mui/material/Typography";
import TitleWidgetWrapper from "./wrapper/Title";
import DataWidgetWrapper from "./wrapper/Data";

const NumericMetric = ({ data }) => {
	const regression = linearRegression(
		data,
		(x) => +new Date(x.Time) / (1000 * 60 * 60),
		(y) => y.Value
	);
	const dataPoint = data[0].Value;

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Typography variant="h1">{dataPoint}</Typography>
			<Typography>Δ/h: {regression.slope.toFixed(3)}</Typography>
		</div>
	);
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
