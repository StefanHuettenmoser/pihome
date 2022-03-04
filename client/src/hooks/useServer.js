import { useState, useEffect, useCallback, useContext } from "react";

export default function useServer(
	serverPromiseFunction,
	args,
	handleData,
	initialValue,
	skip
) {
	const [data, setData] = useState(initialValue);

	const updateData = useCallback(async () => {
		if (skip) return setData(initialValue);
		const { message, data } = await serverPromiseFunction(...(args || []));
		if (message?.msgError) console.log(message);
		const resolvedData = handleData ? handleData(data) : data;
		setData(resolvedData);
	}, [setData, serverPromiseFunction, args, handleData, skip]);

	useEffect(() => {
		updateData();
	}, [updateData]);

	return [data, updateData, setData];
}
