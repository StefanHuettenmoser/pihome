import React, { useMemo } from "react";

import { linearRegression } from "../../../services/helpers/stats";

import Typography from "@mui/material/Typography";
import TitleWidgetWrapper from "./wrapper/Title";
import DataWidgetWrapper from "./wrapper/Data";

const NumericMetric = ({ data }) => {
	const _data = data?.[0].data;
	const regression = useMemo(() => {
		if (!_data) return;
		return linearRegression(
			_data,
			(d) => +new Date(d.Time) / (1000 * 60 * 60),
			(d) => d.Value
		);
	}, [_data]);

	const dataPoint = useMemo(() => {
		if (!_data) return;
		_data.forEach((d) => {
			d.dt = Math.abs(+new Date(d.Time) - +new Date());
		});
		_data.sort((a, b) => a.dt - b.dt);
		return _data[0].Value;
	}, [_data]);
	const dataString =
		dataPoint % 1 === 0 ? dataPoint : dataPoint?.toPrecision(3);
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
			<Typography variant="h1">{dataString}</Typography>
			<Typography>Δ/h: {regression?.slope?.toPrecision(2)}</Typography>
		</div>
	);
};

const NumericMetricWrapper = ({ userWidget, setArguments, editMode }) => {
	return (
		<DataWidgetWrapper
			key={`Widget-LineChart-${userWidget._id}-data-wrapper`}
			userWidget={userWidget}
			setArguments={setArguments}
			editMode={editMode}
		>
			<TitleWidgetWrapper
				key={`Widget-LineChart-${userWidget._id}-title-wrapper`}
			>
				<NumericMetric />
			</TitleWidgetWrapper>
		</DataWidgetWrapper>
	);
};

export default NumericMetricWrapper;
