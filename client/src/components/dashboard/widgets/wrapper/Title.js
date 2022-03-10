import React, { useState, useEffect, cloneElement } from "react";

import Typography from "@mui/material/Typography";

import useDebounce from "../../../../hooks/useDebounce";

const TitleWrapper = ({
	userWidget,
	setArguments,
	editMode,
	children,
	...props
}) => {
	const [name, setName] = useState(userWidget.args.title);
	const debouncedName = useDebounce(name, 300);
	useEffect(() => {
		if (userWidget.args.title !== debouncedName) {
			setArguments(userWidget._id, { title: debouncedName });
		}
	}, [setArguments, debouncedName, userWidget._id, userWidget.args.title]);

	const Widget = cloneElement(children, {
		userWidget,
		setArguments,
		editMode,
		...props,
	});

	return (
		<>
			{!editMode ? (
				<Typography key={`${userWidget._id}-title`} variant="subtitle2">
					{userWidget.args.title}
				</Typography>
			) : (
				<input
					key={`${userWidget._id}-title-edit`}
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			)}
			{Widget}
		</>
	);
};

export default TitleWrapper;
