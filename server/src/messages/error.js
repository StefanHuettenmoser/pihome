const errorMessage = (errorCode) => {
	let msg = "";
	if (errorCode >= 500) {
		msg = "Oops, Something went wrong. Please try again later.";
	} else if (errorCode == 400) {
		msg = "Bad Request";
	} else if (errorCode == 401) {
		msg = "Not Authorized";
	} else if (errorCode == 403) {
		msg = "Forbidden";
	} else if (errorCode == 404) {
		msg = "Not Found";
	} else if (errorCode == 429) {
		msg = "Too many requests";
	} else if (errorCode == 102) {
		msg = "Already Processing";
	} else {
		msg = "Unknown Error";
	}
	return {
		message: {
			msg: msg,
			msgError: errorCode,
		},
	};
};

module.exports = errorMessage;
