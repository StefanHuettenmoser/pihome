import React, { useCallback } from "react";

const SelectWidget = ({ widgets, selectedWidgetID, setSelectedWidgetID }) => {
	const handleSelect = useCallback(
		(_selectedWidget) => {
			setSelectedWidgetID(_selectedWidget);
		},
		[setSelectedWidgetID]
	);
	return (
		<select
			value={selectedWidgetID}
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
