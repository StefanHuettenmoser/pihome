import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Home from "./containers/Home";

function App() {
	return (
		<div className="App">
			<CssBaseline key="css-baseline" />
			<Home key="home" />
		</div>
	);
}

export default App;
