import styles from "../../../css/modules/chart.module.css";

import React, { useMemo } from "react";

import { extent, scaleLinear, scaleTime } from "d3";

import { AxisLinearLeft, AxisLinearBottom } from "../axis/AxisLinear";

import Line from "../components/Line";
import Legend from "../components/Legend";

export default function MultiLineChart({
	data,
	xValue,
	yValue,
	groupValue,
	dataValue,
	dimensions,
	yDomain,
	axisLabelYFormat,
	axisLabelXFormat,
	axisTitleX,
	smooth,
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
	const flatData = useMemo(
		() =>
			data.reduce((prev, curr) => {
				const rawData = dataValue(curr);
				if (!rawData) return prev;
				return [...prev, ...dataValue(curr)];
			}, []),
		[data, dataValue] // FIXME: dataValue should be callback function!
	);
	const xScale = useMemo(
		() => scaleTime().domain(extent(flatData, xValue)).range([0, innerWidth]),
		[flatData, xValue, innerWidth]
	);

	const yScale = useMemo(
		() =>
			scaleLinear()
				.domain(yDomain || extent(flatData, yValue))
				.range([0, innerHeight]),
		[yDomain, flatData, yValue, innerHeight]
	);

	if (flatData.length === 0) return null;
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
				{data.map(
					(d, i) =>
						dataValue(d) && (
							<Line
								key={`line-chart-${axisTitleX}-line-${groupValue(d)}`}
								data={dataValue(d)}
								xScale={xScale}
								yScale={yScale}
								xValue={xValue}
								yValue={yValue}
								height={innerHeight}
								className={`${styles["no-fill"]} ${styles.line} ${
									styles["line-primary"]
								} ${styles[`line-group-${i % 5}`]}`}
								showPoints={showPoints}
								smooth={smooth}
							/>
						)
				)}
				<Legend
					data={data}
					dataValue={dataValue}
					groupValue={groupValue}
					containerHeight={innerHeight}
					containerWidth={innerWidth}
				/>
			</g>
		</svg>
	);
}
