import { useMemo } from "react";
import useWindowResize from "./useWindowResize";
import useTheme from "@mui/material/styles/useTheme";

const getBreakpoint = (width, theme) => {
	let breakpoint = "";
	theme.breakpoints.keys.forEach((key) => {
		const minSize = theme.breakpoints.values[key];
		if (width >= minSize) {
			breakpoint = key;
		}
	});
	console.log(theme.breakpoints.values);
	return breakpoint;
};

const useBreakpoint = () => {
	const theme = useTheme();
	const { width } = useWindowResize();
	const breakpoint = useMemo(() => {
		return getBreakpoint(width, theme);
	}, [width]);

	console.log(breakpoint);
	return breakpoint;
};
export default useBreakpoint;
