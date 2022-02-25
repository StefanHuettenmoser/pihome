//// AUTHORIZED FETCH
////////////////////////////////////////////////////////////////////////////
import { statusToMessage } from "./messages";
import formData from "form-data";

// GET with credentials
export const authGET = (path) => {
	const url = makeUrl(path);
	return fetch(url, {
		credentials: "include",
	});
};
// POST JSON with credentials
export const authPOST = (path, body) => {
	const url = makeUrl(path);
	return fetch(url, {
		method: "POST",
		body: JSON.stringify(body),
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
};
// POST FILE (and other fields) with credentials
export const authFilePOST = (path, body) => {
	const form = new formData();
	Object.keys(body).forEach((key) => {
		form.append(key, body[key]);
	});
	const url = makeUrl(path);
	return fetch(url, {
		method: "POST",
		body: form,
		credentials: "include",
	});
};
// DELETE with with credentials
export const authDELETE = (path) => {
	const url = makeUrl(path);
	return fetch(url, {
		method: "DELETE",
		credentials: "include",
	});
};
// PUT with credentials
export const authPUT = (path, body) => {
	const url = makeUrl(path);
	return fetch(url, {
		method: "PUT",
		body: JSON.stringify(body),
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
};

// generate path to server
const makeUrl = (path) => {
	const url = process.env.REACT_APP_BACKEND_API_PREFIX + path;
	console.log(url);
	return url;
};

// JSON fetch handler
export const handleFetch = async (requestName, fetchRequest) => {
	console.log("FETCH:", requestName);
	try {
		const res = await fetchRequest;
		console.log(res);
		if (res.ok) {
			const data = await res.json();
			return { ...statusToMessage(res.status, res.headers), data: data };
		}
		return { ...statusToMessage(res.status, res.headers), data: null };
	} catch (err) {
		console.log(err);
		return { ...statusToMessage(999, null), data: null };
	}
};
