import React, { useCallback, useMemo } from "react";

import useResize from "../../hooks/useResize";

import { formatDate } from "../../services/helpers/dateUtils";

import LineChart from "./layouts/LineChart";

export default function DataChart({ data, ...props }) {
	const [ref, width, height] = useResize();

	//console.log(args, pdf, domain, x);
	const dimensions = useMemo(() => {
		return {
			width: width,
			height: height,
			margin: { top: 20, right: 20, bottom: 40, left: 60 },
		};
	}, [width, height]);
	const xValue = useCallback((d) => new Date(d.Time), []);
	const yValue = useCallback((d) => d.Value, []);
	const axisLabelDateFormat = (tick_label) => {
		const duration =
			Math.max(...data.map(xValue)) - Math.min(...data.map(xValue));
		let format = "%Y-%m-%dT%H:%M%SZ";
		if (duration < 1000 * 60 * 60 * 24 * 7) {
			format = "%d.%m. %H:00";
		} else if (duration < 1000 * 60 * 60 * 24) {
			format = "%H:%M";
		}
		return formatDate(new Date(tick_label), format);
	};
	return (
		<div ref={ref} {...props}>
			{data && (
				<LineChart
					data={data}
					xValue={xValue}
					yValue={yValue}
					dimensions={dimensions}
					yDomain={undefined}
					axisLabelYFormat={undefined}
					axisLabelXFormat={axisLabelDateFormat}
					axisTitleX={"Test Chart"}
					smooth
					showPoints
				/>
			)}
		</div>
	);
}
