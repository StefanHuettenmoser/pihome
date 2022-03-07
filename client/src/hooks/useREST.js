import { useState, useCallback, useRef, useEffect } from "react";
import useServer from "./useServer";

export default function useResize(RESTService, hasDetails) {
	const [overviewList, update] = useServer(RESTService.getAll);
	const [detailedList, setDetailedList] = useState();

	const getOne = useCallback((_id) => {
		// TODO: IMPLEMENT
	}, []);
	const addOne = useCallback((body) => {
		return RESTService.addOne(body);
	}, []);
	const changeOne = useCallback((_id, body) => {
		console.log("CHANGE ONE");
		console.log(body);
		return RESTService.changeOne(_id, body);
	}, []);
	const deleteOne = useCallback((_id) => {
		return RESTService.deleteOne(_id);
	}, []);

	useEffect(() => {
		setDetailedList(overviewList);
	}, [overviewList]);

	return [
		overviewList,
		getOne,
		addOne,
		changeOne,
		deleteOne,
		update,
		detailedList,
	];
}
