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
		let format = "%m.%Y";
		if (duration < 1000 * 60 * 60 * 24) {
			format = "%H:%M";
		} else if (duration < 1000 * 60 * 60 * 24 * 31 * 4) {
			format = "%d.%m.";
		}
		return formatDate(new Date(tick_label), format);
	};
	return (
		<div ref={ref} {...props}>
			{data && height && width && (
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
