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

  if (!isOriginAllowed(origin)) {
    // Return headers without ACAO — browser will reject the response.
    return {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-monitoring-key',
    };
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-monitoring-key',
    'Vary': 'Origin',
  };
}
