import React, { useContext, useCallback, useEffect, cloneElement } from "react";

import { DataContext } from "../../../../context/DataContext";

const DataWrapper = ({
	userWidget,
	setArguments,
	editMode,
	children,
	...props
}) => {
	const { tableNames, getData, subscribe, unsubscribe } =
		useContext(DataContext);

	const handleSelect = useCallback(
		(tableName) => {
			if (userWidget.args.referenceTable !== tableName) {
				setArguments(userWidget._id, { referenceTable: tableName });
			}
		},
		[setArguments, userWidget._id, userWidget.args.referenceTable]
	);
	useEffect(() => {
		subscribe(userWidget.args.referenceTable);
		return () => unsubscribe(userWidget.args.referenceTable);
	}, [userWidget.args.referenceTable, subscribe, unsubscribe]);

	const data = getData(userWidget.args.referenceTable);
	const Widget = cloneElement(children, {
		data,
		userWidget,
		setArguments,
		editMode,
		...props,
	});
	return (
		<>
			{editMode && (
				<>
					{tableNames && (
						<select
							key={`data-dropdown-${userWidget._id}`}
							onChange={(e) => handleSelect(e.target.value)}
							value={userWidget.args.referenceTable}
						>
							{tableNames.map((tableName) => (
								<option
									key={`data-dropdown-${userWidget._id}-element-${tableName}`}
								>
									{tableName}
								</option>
							))}
						</select>
					)}
				</>
			)}
			<>{data && Widget}</>
		</>
	);
};

export default DataWrapper;
