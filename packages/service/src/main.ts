const defaultReponseOptions: ResponseInit = {
	headers: {
		'Content-Type': 'applicaion/json'
	},
	status: 200
};

function JsonResponse(responseBody: Record<string, unknown>, options?: ResponseInit): Response {
	return new Response(JSON.stringify(responseBody), { ...defaultReponseOptions, ...options });
}

function ErrorResponse(errorMsg: string, options?: ResponseInit): Response {
	return JsonResponse({ error: errorMsg }, { status: 400, ...options });
}

function Error404Response(): Response {
	return new Response(null, { status: 404 });
}

async function handleRequest(request: Request): Promise<Response> {
	const method = request.method;
	const requestURL = new URL(request.url);
	const pathName = requestURL.pathname;

	if (method !== 'GET' || pathName.length < 5) {
		return Error404Response();
	}

	const shortPath = pathName.replace('/', '');
	const ogURL = await KVStore.get(shortPath);

	if (!ogURL) {
		return ErrorResponse('Provided path not found');
	}

	return Response.redirect(ogURL, 301);
}

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});
