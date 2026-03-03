/**
 * CORS and CSRF protection utilities for API routes.
 * 
 * - Validates the Origin/Referer header to prevent cross-site request forgery.
 * - Adds proper CORS headers to responses.
 * - Rejects requests from disallowed origins.
 */

/**
 * Get the list of allowed origins from environment or defaults.
 */
function getAllowedOrigins() {
    const envOrigins = process.env.ALLOWED_ORIGINS
    if (envOrigins) {
        return envOrigins.split(",").map(o => o.trim())
    }
    // Default: allow localhost during development
    return [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ]
}

/**
 * Validate that a request comes from an allowed origin.
 * Checks both Origin and Referer headers.
 * 
 * @param {Request} request
 * @returns {{ valid: boolean, origin: string|null }}
 */
export function validateOrigin(request) {
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    const allowed = getAllowedOrigins()

    // Check Origin header first (preferred for CORS)
    if (origin) {
        return { valid: allowed.some(a => origin.startsWith(a)), origin }
    }

    // Fallback to Referer header (for same-origin form submissions)
    if (referer) {
        const refOrigin = new URL(referer).origin
        return { valid: allowed.some(a => refOrigin.startsWith(a)), origin: refOrigin }
    }

    // No Origin or Referer — could be a server-to-server call or same-origin navigation.
    // In production, you may want to reject these. For now, allow with caution.
    return { valid: true, origin: null }
}

/**
 * Add CORS headers to a Response object.
 * 
 * @param {Response} response
 * @param {string|null} origin
 * @returns {Response}
 */
export function addCorsHeaders(response, origin) {
    const headers = new Headers(response.headers)
    if (origin) {
        headers.set("Access-Control-Allow-Origin", origin)
    }
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type")
    headers.set("Access-Control-Max-Age", "86400") // Cache preflight for 24h

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

/**
 * Create a 403 Forbidden response for blocked origins.
 * @returns {Response}
 */
export function forbiddenOriginResponse() {
    return Response.json(
        { error: "Forbidden: request origin not allowed" },
        { status: 403 }
    )
}
