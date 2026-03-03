export function createErrorResponse(message, status = 500) {
    return Response.json({ error: message }, { status })
}

export function handleApiError(error) {
    const message = error?.message || "Internal server error"
    const status = error?.status || 500
    return createErrorResponse(message, status)
}
