import { useState, useCallback, useRef, useEffect } from "react";

export default function useResize() {
	const ref = useRef(null);
	const [width, setWidth] = useState();
	const [height, setHeight] = useState();

	const handleResize = useCallback(
		(e) => {
			setWidth(ref?.current?.offsetWidth);
			setHeight(ref?.current?.offsetHeight);
		},
		[setWidth, setHeight, ref]
	);

	useEffect(() => {
		if (!ref?.current) return;

		const observer = new ResizeObserver((entries) => {
			handleResize(entries);
		});
		observer.observe(ref.current);

		return () => {
			observer.disconnect();
		};
	}, [handleResize, ref]);

	return [ref, width, height];
}
