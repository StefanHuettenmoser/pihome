const nodemon = require("nodemon");

nodemon({
	execMap: {
		js: "node",
	},
	script: "src/index",
	ignore: [],
	watch: process.env.NODE_ENV !== "production" ? ["*"] : false,
	ext: "js",
})
	.on("restart", function () {
		console.info("Server restarted!");
	})
	.once("exit", function () {
		console.info("Server shut down");
		// to restart on shutdown, leave commented
		//process.exit();
	});
