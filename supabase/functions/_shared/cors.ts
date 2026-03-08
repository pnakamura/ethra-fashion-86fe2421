/**
 * Shared CORS configuration for Edge Functions.
 *
 * Restricts Access-Control-Allow-Origin to known production and
 * development domains instead of the wildcard '*'.
 */

const ALLOWED_ORIGINS: string[] = [
  'https://ethra.app',
  'https://www.ethra.app',
];

/** Patterns for dynamic origins (preview deploys, local dev). */
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^http:\/\/localhost:\d+$/,
];

const ALLOW_HEADERS = [
  'authorization',
  'x-client-info',
  'apikey',
  'content-type',
  'x-monitoring-key',
  'x-supabase-client-platform',
  'x-supabase-client-platform-version',
  'x-supabase-client-runtime',
  'x-supabase-client-runtime-version',
].join(', ');

const ALLOW_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));
}

/**
 * Build CORS headers scoped to the requesting origin.
 *
 * If the origin is not in the allow-list the
 * `Access-Control-Allow-Origin` header is omitted so the browser
 * will block the response (standard CORS enforcement).
 */
export function createCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';

  const baseHeaders = {
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Access-Control-Allow-Methods': ALLOW_METHODS,
  };

  if (!isOriginAllowed(origin)) {
    // Return headers without ACAO — browser will reject the response.
    return baseHeaders;
  }

  return {
    ...baseHeaders,
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
  };
}

