const wrapMessage = (msg, msgError, x) => {
	return {
		message: {
			msg,
			msgError,
			x,
		},
	};
};

export const statusToMessage = (status, headers) => {
	if (status === 201) return wrapMessage("msg_201", false);
	if (status === 401) return wrapMessage("msg_401", status);
	if (status === 403) return wrapMessage("msg_403", status);
	if (status === 404) return wrapMessage("msg_404", status);
	if (status === 409) return wrapMessage("msg_409", status);
	if (status === 429)
		return wrapMessage(
			"msg_429",
			status,
			Math.ceil(+headers.get("expires") / 60)
		);

	if (status < 200) return wrapMessage("msg_s200", status);
	if (status < 300) return wrapMessage("msg_s300", false);
	if (status < 400) return wrapMessage("msg_s400", status);
	if (status < 500) return wrapMessage("msg_s500", status);
	return wrapMessage("msg_s999", status);
};
