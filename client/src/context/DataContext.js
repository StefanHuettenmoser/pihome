import React, { createContext, useState, useEffect, useCallback } from "react";

import useServer from "../hooks/useServer";
import DataService from "../services/DataService";

export const DataContext = createContext();

export default function DataContextProvider({
	interval_ms = 60 * 1000,
	children,
}) {
	const [tableNames] = useServer(DataService.getTableNames);
	const [subscriptions, setSubscriptions] = useState([]);
	const [dataCollection, setDataCollection] = useState({});

	const update = useCallback(async () => {
		if (subscriptions.length === 0) return;

		const newData = {};
		// download data and save to state
		const results = await Promise.all(
			// for every (unique) subscription:
			[...new Set(subscriptions)].map(async (subscription) => {
				const { message, data } = await DataService.getTableData(subscription);
				if (message.msgError) {
					console.log(message);
				}
				return { subscription, data };
			})
		);
		results.forEach(({ subscription, data }) => {
			newData[subscription] = data;
		});
		setDataCollection(newData);
	}, [subscriptions]);

	const subscribe = useCallback(
		(tableNames) => {
			if (!tableNames) return;
			if (typeof tableNames !== "object") tableNames = [tableNames];
			setSubscriptions((prev) => [...prev, ...tableNames]);
		},
		[setSubscriptions]
	);

	const unsubscribeOne = useCallback(
		(tableName) => {
			if (!tableName) return;
			setSubscriptions((prev) => {
				const index = prev.indexOf(tableName);
				if (index !== -1) {
					const prevCopy = [...prev];
					prevCopy.splice(index, 1);
					return prevCopy;
				}
				return prev;
			});
		},
		[setSubscriptions]
	);
	const unsubscribe = useCallback(
		(tableNames) => {
			if (typeof tableNames !== "object") tableNames = [tableNames];
			tableNames.forEach((tableName) => unsubscribeOne(tableName));
		},
		[unsubscribeOne]
	);
	const getData = useCallback(
		(tableNames) => {
			if (!tableNames) return;
			if (typeof tableNames !== "object") tableNames = [tableNames];
			return tableNames.reduce((prev, tableName) => {
				prev.push({
					tableName,
					data: dataCollection[tableName],
				});
				return prev;
			}, []);
		},
		[dataCollection]
	);
	useEffect(() => {
		update();
		const interval = setInterval(() => {
			update();
		}, interval_ms);
		return () => {
			clearInterval(interval);
		};
	}, [update, interval_ms]);

	return (
		<DataContext.Provider
			value={{
				tableNames,
				subscribe,
				unsubscribe,
				getData,
				forceUpdate: update,
			}}
		>
			{children}
		</DataContext.Provider>
	);
}
