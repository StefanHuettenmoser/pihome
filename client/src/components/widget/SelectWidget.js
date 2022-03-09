import React, { useCallback } from "react";

const SelectWidget = ({ widgets, selectedWidget, setSelectedWidget }) => {
	const handleSelect = useCallback(
		(_selectedWidget) => {
			setSelectedWidget(_selectedWidget);
		},
		[setSelectedWidget]
	);
	console.log(widgets);
	return (
		<select
			value={selectedWidget}
			onChange={(e) => handleSelect(e.target.value)}
		>
			{widgets.map((widget) => (
				<option
					key={`widget-dropdown-element-${widget._id}`}
					value={widget._id}
				>
					{widget.widget_name}
				</option>
			))}
		</select>
	);
};

export default SelectWidget;
