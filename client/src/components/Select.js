import React, { useCallback } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MuiSelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const Select = ({
	name,
	label,
	data,
	getValue,
	getName,
	value,
	onChange,
	multiple,
	input,
	...props
}) => {
	return (
		<FormControl {...props}>
			<InputLabel id={`select-${name}-label`}>{label}</InputLabel>
			<MuiSelect
				labelId={`select-${name}-label`}
				id={`select-${name}-${label}-id`}
				value={value}
				label={label}
				onChange={onChange}
				multiple={multiple}
				input={input}
			>
				{data.map((d) => (
					<MenuItem
						key={`${name}-dropdown-element-${getValue(d)}`}
						value={getValue(d)}
					>
						{getName(d)}
					</MenuItem>
				))}
			</MuiSelect>
		</FormControl>
	);
};

export default Select;
