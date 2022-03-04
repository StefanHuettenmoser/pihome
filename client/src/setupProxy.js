const { createProxyMiddleware } = require("http-proxy-middleware");

let ip = Object.values(require("os").networkInterfaces()).reduce(
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
// TODO: remove? only for dev with no internet
if (!ip.length) {
	ip = "localhost";
}

module.exports = (app) => {
	app.use(
		"/api",
		createProxyMiddleware({
			target: `http://${ip}:${process.env.REACT_APP_BACKEND_PORT}`,
			changeOrigin: false,
		})
	);
};
