import React from "react";

import styles from "../../../css/modules/chart.module.css";

const Legend = ({
	data,
	dataValue,
	groupValue,
	containerWidth,
	containerHeight,
	bottom,
	...props
}) => {
	const margin = 20;
	const spacing = (containerWidth - 2 * margin) / data.length;
	const squareSize = containerWidth / 2 ** 7;
	return (
		<g
			transform={`translate(${margin},${bottom ? containerHeight + 40 : -15})`}
		>
			{data.map(
				(d, i) =>
					dataValue(d) && (
						<g transform={`translate(${spacing * i},0)`}>
							<path
								key={`legend-square-${groupValue(d)}`}
								d={`m0 0 L${-squareSize} 0 L${-squareSize} ${-squareSize} L0 ${-squareSize} Z`}
								className={`${styles[`fill-group-${i % 5}`]}`}
							/>
							<text
								style={{ fontSize: `${1.4 * squareSize}px` }}
								dx={`${squareSize}px`}
							>
								{groupValue(d).split("$")[groupValue(d).split("$").length - 1]}
							</text>
						</g>
					)
			)}
		</g>
	);
};
export default Legend;
