import React, { useCallback, useMemo } from "react";

import useResize from "../../hooks/useResize";

import { formatDate } from "../../services/helpers/dateUtils";

import MultiLineChart from "./layouts/MultiLineChart";

export default function DataChart({ data, ...props }) {
	const [ref, width, height] = useResize();

	//console.log(args, pdf, domain, x);
	const dimensions = useMemo(() => {
		return {
			width: width,
			height: height,
			margin: { top: 40, right: 10, bottom: 20, left: 45 },
		};
	}, [width, height]);
	const xValue = useCallback((d) => new Date(d.Time), []);
	const yValue = useCallback((d) => d.Value, []);
	const dataValue = useCallback((d) => d.data, []);
	const groupValue = useCallback((d) => d.tableName, []);
	const axisLabelDateFormat = (tickLabel) => {
		const duration =
			Math.max(...data.map(xValue)) - Math.min(...data.map(xValue));
		let format = "%m.%Y";
		if (duration < 1000 * 60 * 60 * 24) {
			format = "%H:%M";
		} else if (duration < 1000 * 60 * 60 * 24 * 31 * 4) {
			format = "%d.%m.";
		}
		return formatDate(new Date(tickLabel), format);
	};
	const axisLabelUnitFormat = (tickLabel) =>
		+tickLabel % 1 === 0 ? tickLabel : +tickLabel.toPrecision(4);
	return (
		<div ref={ref} {...props}>
			{data && height && width && (
				<MultiLineChart
					data={data}
					xValue={xValue}
					yValue={yValue}
					dataValue={dataValue}
					groupValue={groupValue}
					dimensions={dimensions}
					yDomain={undefined}
					axisLabelYFormat={axisLabelUnitFormat}
					axisLabelXFormat={axisLabelDateFormat}
					axisTitleX={"Test Chart"}
					smooth
					showPoints
				/>
			)}
		</div>
	);
}
