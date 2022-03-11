import React, { useContext, useCallback, useEffect, cloneElement } from "react";

import { DataContext } from "../../../../context/DataContext";

import Select from "../../../Select";
import OutlinedInput from "@mui/material/OutlinedInput";

const DataWrapper = ({
	userWidget,
	setArguments,
	editMode,
	children,
	...props
}) => {
	const { tableNames, getData, subscribe, unsubscribe } =
		useContext(DataContext);
	if (
		userWidget.args.referenceTable &&
		typeof userWidget.args.referenceTable !== "object"
	) {
		console.warn("Update widget from previous version config");
		setArguments(userWidget._id, {
			referenceTable: [userWidget.args.referenceTable],
		});
	}
	const handleSelect = useCallback(
		(selectedTableNames) => {
			// TODO: 1: filter: accept only if tableNames.includes(tableName)
			if (userWidget.args.referenceTable.length === selectedTableNames.length)
				return;
			// TODO: 2: check if length is same and all elements are included
			setArguments(userWidget._id, { referenceTable: selectedTableNames });
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
						<Select
							name={`select-data-${userWidget._id}`}
							label="Select Data"
							data={tableNames}
							getValue={(d) => d}
							getName={(d) => d}
							value={userWidget.args.referenceTable}
							onChange={(e) => handleSelect(e.target.value)}
							multiple
							input={<OutlinedInput label="Name" />}
						/>
					)}
				</>
			)}
			<>{data?.length > 0 ? Widget : <div>No Data...</div>}</>
		</>
	);
};

export default DataWrapper;
