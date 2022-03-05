import React from "react";

import useTheme from "@mui/material/styles/useTheme";
import useBreakpoint from "../hooks/useBreakpoint";

import Container from "@mui/material/Container";
import Dashboard from "../components/Dashboard";

const columns = {
	xs: 1,
	sm: 1,
	md: 2,
	lg: 4,
	xl: 6,
};

const Home = () => {
	const theme = useTheme();
	const breakpoint = useBreakpoint();
	return (
		<Container
			key="home-container"
			sx={{ background: theme.palette.grey.A100, py: 3 }}
		>
			<Dashboard key="home-dashboard" columns={columns[breakpoint]} />
		</Container>
	);
};

export default Home;
