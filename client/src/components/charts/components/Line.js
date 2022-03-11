import React from "react";

import { line, curveNatural, curveLinear } from "d3";

const Line = ({
	data,
	xScale,
	yScale,
	xValue,
	yValue,
	height,
	className,
	showPoints,
	smooth,
}) => (
	<>
		<path
			d={line()
				.x((d) => xScale(xValue(d)) || 0)
				.y((d) => height - (yScale(yValue(d)) || 0))
				.curve(smooth ? curveNatural : curveLinear)(data)}
			className={className}
		/>
		{showPoints &&
			data.map((d, i) => (
				<circle
					key={i}
					cx={xScale(xValue(d))}
					cy={height - yScale(yValue(d))}
					r={2}
					className={className}
				/>
			))}
	</>
);
export default Line;
