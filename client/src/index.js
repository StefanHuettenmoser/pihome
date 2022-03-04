import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import DataContextProvider from "./context/DataContext";

ReactDOM.render(
	<React.StrictMode>
		<DataContextProvider key="DataContextProvider">
			<App key="app" />
		</DataContextProvider>
	</React.StrictMode>,
	document.getElementById("root")
);
