export const API_BASE_URL: string = 
  (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.PROD ? "https://grading-backend-1.onrender.com" : "http://localhost:3001");

export type ApiFetchOptions = RequestInit & {
  // If true, will set Content-Type: application/json when body is an object
  jsonBody?: unknown;
  // If true, will include authentication headers
  requireAuth?: boolean;
};

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { jsonBody, headers, requireAuth = false, credentials = 'include', ...rest } = options;

  const init: RequestInit = { 
    ...rest,
    credentials: credentials as RequestCredentials
  };
  const finalHeaders = new Headers(headers || {});

  if (jsonBody !== undefined) {
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
    init.body = JSON.stringify(jsonBody);
    init.method = init.method || "POST";
  }

  // Only set headers if we actually have any; avoids issues with FormData auto headers
  if ([...finalHeaders.keys()].length > 0) {
    init.headers = finalHeaders;
  }

  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, init);
  
  // Handle 401 errors by redirecting to auth
  if (response.status === 401) {
    window.location.href = '/auth'
    throw new Error('Authentication required')
  }
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Request failed ${response.status}: ${text || response.statusText}`);
  }
  
  // Try to parse JSON; if it fails, return as any
  try {
    return (await response.json()) as T;
  } catch {
    // @ts-expect-error intentionally returning raw response body
    return await response.text();
  }
} 