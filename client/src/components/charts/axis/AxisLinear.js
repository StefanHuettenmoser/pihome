import React from "react";

import styles from "../../../css/modules/chart.module.css";

export const AxisLinearLeft = ({
	yScale,
	height,
	width,
	nTicks,
	className,
	axisLabelFormat,
	axisTitle,
}) => (
	<g>
		{axisTitle && (
			<text
				transform={`translate(0,${height / 2})`}
				style={{ textAnchor: "end" }}
				dx={"-3.2em"}
				dy={"0.3em"}
				className={styles["axis-title"]}
			>
				{axisTitle}
			</text>
		)}
		{yScale.ticks(nTicks).map((tickValue, i) => (
			<g
				key={`${axisTitle}-y-tickValue-${i}`}
				transform={`translate(0,${height - yScale(tickValue)})`}
				className={className}
			>
				<line x2={width} key={`${axisTitle}-y-tickValue-${i}-line`} />
				<text
					style={{ textAnchor: "end" }}
					dx={"-.5em"}
					dy={"0.4em"}
					key={`${axisTitle}-y-tickValue-${i}-text`}
				>
					{axisLabelFormat ? axisLabelFormat(tickValue) : tickValue}
				</text>
			</g>
		))}
	</g>
);

export const AxisLinearBottom = ({
	xScale,
	height,
	nTicks,
	className,
	axisLabelFormat,
	axisTitle,
}) => {
	return xScale.ticks(nTicks).map((tickValue, i) => (
		<g
			key={`${axisTitle}-x-tickValue-${i}`}
			transform={`translate(${xScale(tickValue)},${height})`}
			className={className}
		>
			<line y2={-height} key={`${axisTitle}-x-tickValue-${i}-line`} />
			<text
				style={{ textAnchor: "middle" }}
				dy={"1.2em"}
				key={`${axisTitle}-x-tickValue-${i}-text`}
			>
				{axisLabelFormat ? axisLabelFormat(tickValue) : tickValue}
			</text>
		</g>
	));
};
