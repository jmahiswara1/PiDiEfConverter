/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach per IP address.
 * 
 * NOTE: This works per-instance. For multi-instance deployments (e.g. serverless),
 * consider using a shared store like Redis or Vercel KV.
 */

const windowMs = 60 * 1000 // 1 minute window
const maxRequests = 10      // max requests per window per IP

const ipHits = new Map()

// Clean up stale entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [ip, hits] of ipHits.entries()) {
        const validHits = hits.filter(t => now - t < windowMs)
        if (validHits.length === 0) {
            ipHits.delete(ip)
        } else {
            ipHits.set(ip, validHits)
        }
    }
}, 5 * 60 * 1000)

/**
 * Check if a request is within the rate limit.
 * @param {Request} request - The incoming request
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(request) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "unknown"

    const now = Date.now()
    const hits = (ipHits.get(ip) || []).filter(t => now - t < windowMs)

    if (hits.length >= maxRequests) {
        const oldestHit = hits[0]
        const resetIn = Math.ceil((oldestHit + windowMs - now) / 1000)
        return { allowed: false, remaining: 0, resetIn }
    }

    hits.push(now)
    ipHits.set(ip, hits)

    return { allowed: true, remaining: maxRequests - hits.length, resetIn: 0 }
}

/**
 * Create a 429 Too Many Requests response.
 * @param {number} resetIn - Seconds until the rate limit resets
 * @returns {Response}
 */
export function rateLimitResponse(resetIn) {
    return Response.json(
        { error: "Too many requests. Please try again later." },
        {
            status: 429,
            headers: {
                "Retry-After": String(resetIn),
            },
        }
    )
}
