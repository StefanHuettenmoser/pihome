const successMessage = (msg) => {
	return {
		message: {
			msg: msg,
			msgError: null,
		},
	};
};

module.exports = successMessage;
