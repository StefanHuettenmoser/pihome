require("dotenv").config();

const app = require("./server");

const port = process.env.PORT;
const ip = Object.values(require("os").networkInterfaces()).reduce(
	(r, list) =>
		r.concat(
			list.reduce(
				(rr, i) =>
					rr.concat((i.family === "IPv4" && !i.internal && i.address) || []),
				[]
			)
		),
	[]
);

app.listen(port, (err) => {
	if (err) console.error(err);
	console.info();
	console.info("***************************************************");
	console.info("Start Pihome Backend");
	console.info(new Date() + "\n");
	console.info(`   local network:\t http://${ip}:${port}`);
	console.info(`   local system:\t http://localhost:${port}`);
});
