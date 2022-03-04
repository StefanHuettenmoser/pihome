import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Dashboard from "./containers/Dashboard";

function App() {
	return (
		<div className="App">
			<CssBaseline key="css-baseline" />
			<Dashboard key="home" />
		</div>
	);
}

export default App;
