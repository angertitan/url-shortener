import { base64, base64url } from 'rfc4648';

interface PostRequestBody {
	type: 'random' | 'custom';
	redirectURL: string;
	length?: number;
	path?: string;
}

interface PutRequestBody {
	shortPath: string;
	redirectURL: string;
}

interface DeleteRequestBody {
	shortPath: string;
}
// invert injected variable to prevent dead code elimination on prod build
const dryRun = !DRY_RUN;

const defaultReponseOptions: ResponseInit = {
	headers: {
		'Content-Type': 'applicaion/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
		'Access-Control-Allow-Headers':
			'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
	},
	status: 200
};

function JsonResponse(responseBody: Record<string, unknown>, options?: ResponseInit): Response {
	return new Response(JSON.stringify(responseBody), { ...defaultReponseOptions, ...options });
}

function ErrorResponse(errorMsg: string, options?: ResponseInit): Response {
	return JsonResponse({ error: errorMsg }, { status: 400, ...options });
}

function SuccessResponse(shortPath: string, redirectURL: string): Response {
	return JsonResponse({
		success: true,
		shortPath,
		url: `https://xnth.link/${shortPath}`,
		redirectURL
	});
}

function Error404Response(): Response {
	return new Response(null, { status: 404 });
}

async function createNewShortURL(body: PostRequestBody): Promise<Response> {
	if (body.length && body.length < 5) {
		ErrorResponse('shortURL length must be atleast 5');
	}

	if (body.type === 'custom' && body.path) {
		const exists = KVStore.get(body.path);
		if (exists) {
			return ErrorResponse('custom path already exists');
		}
		dryRun && (await KVStore.put(body.path, body.redirectURL));
		return SuccessResponse(body.path, body.redirectURL);
	}

	if (body.type === 'random') {
		const randStringResponse = await fetch(
			`https://csprng.xyz/v1/api?length=${body.length || 6}&format=base64`
		);
		const randStringB64 = await randStringResponse.json();
		// parse standart base64 and then stringify into base64url
		const urlSaveString = base64url.stringify(base64.parse(randStringB64.Data));

		dryRun && (await KVStore.put(urlSaveString, body.redirectURL));
		return SuccessResponse(urlSaveString, body.redirectURL);
	}

	return ErrorResponse('no type specified. Type must be either "random" or "custom"');
}

async function handleRequest(request: Request): Promise<Response> {
	const apiKey = request.headers.get('x-api-key');
	if (apiKey !== SECRET_API_KEY) {
		return ErrorResponse('Missing or invalid API key.', { status: 401 });
	}

	const method = request.method;
	const requestURL = new URL(request.url);
	const pathName = requestURL.pathname;

	if (pathName !== '/') {
		return Error404Response();
	}

	if (method === 'GET') {
		const shortURLResponse = await KVStore.list();
		const shortURLs = shortURLResponse.keys;

		const urlPairPromises = shortURLs.map(async shortURL => {
			const ogURL = await KVStore.get(shortURL.name);
			return { [shortURL.name]: ogURL };
		});

		const urlPairArray = await Promise.all(urlPairPromises);
		const urlPairs = urlPairArray.reduce((obj, urlPair) => {
			return { ...obj, ...urlPair };
		}, {});

		return JsonResponse(urlPairs);
	}

	if (method === 'POST') {
		const body = (await request.json()) as PostRequestBody;

		const response = createNewShortURL(body);
		return response;
	}

	if (method === 'PUT') {
		const body = (await request.json()) as PutRequestBody;

		const exists = await KVStore.get(body.shortPath);

		if (exists === null) {
			ErrorResponse(`URL ${body.shortPath} doesn't exists.`);
		}

		await KVStore.put(body.shortPath, body.redirectURL);
		return JsonResponse({ success: true, shortURL: body.shortPath, redirectURL: body.redirectURL });
	}

	if (method === 'DELETE') {
		const body = (await request.json()) as DeleteRequestBody;

		const redirectURL = await KVStore.get(body.shortPath);

		if (redirectURL === null) {
			ErrorResponse(`URL ${body.shortPath} doesn't exists.`);
		}

		await KVStore.delete(body.shortPath);
		return JsonResponse({ success: true, shortURL: body.shortPath, redirectURL });
	}

	return Error404Response();
}

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});
