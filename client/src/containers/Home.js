import React, { useMemo } from "react";
import useServer from "../hooks/useServer";

import DataService from "../services/DataService";

const Home = () => {
	const [tableNames] = useServer(DataService.getTableNames);
	console.log(tableNames);
	return (
		<div>
			<h1 key="title">Tables</h1>
			<>
				{tableNames && (
					<ul>
						{tableNames.map((tableName, i) => (
							<li key={i}>{tableName}</li>
						))}
					</ul>
				)}
			</>
		</div>
	);
};

export default Home;
