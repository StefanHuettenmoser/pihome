const { createProxyMiddleware } = require("http-proxy-middleware");

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

module.exports = (app) => {
	app.use(
		"/api",
		createProxyMiddleware({
			target: `http://${ip}:${process.env.REACT_APP_BACKEND_PORT}`,
			changeOrigin: false,
		})
	);
};
