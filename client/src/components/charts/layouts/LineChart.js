import styles from "../../../css/modules/chart.module.css";

import React, { useMemo } from "react";

import {
	extent,
	scaleLinear,
	scaleTime,
	line,
	curveNatural,
	curveLinear,
} from "d3";

import { AxisLinearLeft, AxisLinearBottom } from "../axis/AxisLinear";

export default function LineChart({
	data,
	xValue,
	yValue,
	dimensions,
	yDomain,
	axisLabelYFormat,
	axisLabelXFormat,
	axisTitleX,
	smooth,
	filled,
	showPoints,
}) {
	const innerWidth = useMemo(
		() => dimensions.width - dimensions.margin.left - dimensions.margin.right,
		[dimensions]
	);
	const innerHeight = useMemo(
		() => dimensions.height - dimensions.margin.top - dimensions.margin.bottom,
		[dimensions]
	);

	const xScale = useMemo(
		() => scaleTime().domain(extent(data, xValue)).range([0, innerWidth]),
		[data, xValue, innerWidth]
	);

	const yScale = useMemo(
		() =>
			scaleLinear()
				.domain(yDomain || extent(data, yValue))
				.range([0, innerHeight]),
		[yDomain, data, yValue, innerHeight]
	);

	if (data.length === 0) return null;
	return (
		<svg width={dimensions.width} height={dimensions.height}>
			<g
				key={`line-chart-${axisTitleX}`}
				transform={`translate(${dimensions.margin.left},${dimensions.margin.top})`}
			>
				<AxisLinearLeft
					key={`line-chart-${axisTitleX}-axisX`}
					yScale={yScale}
					height={innerHeight}
					width={innerWidth}
					nTicks={6}
					className={`${styles["axis-label"]} ${styles["gridline-light"]}`}
					axisLabelFormat={axisLabelYFormat}
					axisTitle={axisTitleX}
				/>
				<AxisLinearBottom
					key={`line-chart-${axisTitleX}-axisY`}
					xScale={xScale}
					height={innerHeight}
					nTicks={4}
					axisLabelFormat={axisLabelXFormat}
					className={`${styles["axis-label"]} ${styles["gridline-light"]}`}
				/>
				<Line
					key={`line-chart-${axisTitleX}-line`}
					data={data}
					xScale={xScale}
					yScale={yScale}
					xValue={xValue}
					yValue={yValue}
					height={innerHeight}
					className={`${filled ? styles["primary"] : styles["no-fill"]} ${
						styles.line
					} ${filled ? styles["line-secondary"] : styles["line-primary"]}`}
					showPoints={showPoints}
					smooth={smooth}
				/>
			</g>
		</svg>
	);
}

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
