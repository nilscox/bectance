const apiUrl = process.env.API_URL;
const debug = process.env.DEBUG === 'true';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiEndpointParams {
  query?: Record<string, string>;
  body?: unknown;
}

export async function api<T>(method: HttpMethod, path: string, params?: ApiEndpointParams): Promise<T> {
  const url = new URL(path, apiUrl);
  const headers = new Headers();

  const init: RequestInit = {
    method,
    headers,
  };

  if (params?.query !== undefined) {
    url.search = new URLSearchParams(params.query).toString();
  }

  if (params?.body !== undefined) {
    headers.append('Content-Type', 'application/json');
    init.body = JSON.stringify(params.body);
  }

  const response = await fetch(url, init);

  if (debug) {
    console.log('---');
    logRequest(url, init);
    await logResponse(response);
    console.log('---');
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.headers.get('Content-Type')?.startsWith('application/json')) {
    return response.json();
  }

  return undefined as T;
}

function logRequest(url: URL, init: RequestInit) {
  console.log('REQUEST:', init.method, url.toString());

  const headers = new Headers(init.headers);
  const contentType = headers.get('Content-Type');

  let body: unknown = undefined;

  if (contentType?.startsWith('application/json')) {
    body = JSON.parse(init.body as string);
  }

  if (contentType?.startsWith('text/plain')) {
    body = init.body;
  }

  if (body !== undefined) {
    console.log(body);
  }
}

async function logResponse(res: Response) {
  console.log('RESPONSE:', res.status, res.statusText);

  let body: unknown = undefined;

  if (res.headers.get('Content-Type')?.startsWith('application/json')) {
    body = await res.clone().json();
  }

  if (res.headers.get('Content-Type')?.startsWith('text/plain')) {
    body = await res.clone().text();
  }

  if (body !== undefined) {
    console.log(body);
  }
}
