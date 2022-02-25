import React, { useState, useMemo } from "react";
import DataChart from "../components/charts/DataChart";
import SelectList from "../components/SelectList";
import useServer from "../hooks/useServer";

import DataService from "../services/DataService";

const Home = () => {
	const [tableNames] = useServer(DataService.getTableNames);
	const [tableName, setTableName] = useState();
	const [tableData] = useServer(
		DataService.getTableData,
		useMemo(() => [tableName], [tableName]),
		undefined,
		undefined,
		!tableName
	);

	const onSelect = ($tableName) => {
		setTableName($tableName);
		console.log($tableName);
	};
	console.log(tableData);

	return (
		<div style={{ padding: "1em" }}>
			<SelectList
				key="Home-SelectList"
				listElements={tableNames}
				onSelect={onSelect}
				title="Tables"
			/>
			<DataChart
				data={tableData}
				style={{ height: "300px", width: "400px" }}
				key="Home-DataChart"
			/>
		</div>
	);
};

export default Home;
