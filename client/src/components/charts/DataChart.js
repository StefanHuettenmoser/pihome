import React, { useCallback, useMemo } from "react";

import useResize from "../../hooks/useResize";

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
					axisLabelXFormat={undefined}
					axisTitleX={"Test Chart"}
					smooth
					showPoints
				/>
			)}
		</div>
	);
}
