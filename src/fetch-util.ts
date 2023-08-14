export const fetchLC = async (query: { query: string; variables: any; operationName: string }) => {
	const res = await fetch(process.env.LC_API_HOST, {
		method: 'POST',
		body: JSON.stringify(query),
		headers: {
			cookie: document.cookie,
			'content-type': 'application/json'
		}
	});

	return res.json();
};
