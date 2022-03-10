// customized from https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
export const linearRegression = (data, fx, fy) => {
	var lr = {};
	var n = data.length;
	var sum_x = 0;
	var sum_y = 0;
	var sum_xy = 0;
	var sum_xx = 0;
	var sum_yy = 0;

	for (var i = 0; i < data.length; i++) {
		const x = fx(data[i]);
		const y = fy(data[i]);
		sum_x += x;
		sum_y += y;
		sum_xy += x * y;
		sum_xx += x * x;
		sum_yy += y * y;
	}

	lr["slope"] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
	lr["intercept"] = (sum_y - lr.slope * sum_x) / n;
	lr["r2"] = Math.pow(
		(n * sum_xy - sum_x * sum_y) /
			Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)),
		2
	);

	return lr;
};
