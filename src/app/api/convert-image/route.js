import sharp from "sharp"
import { validateImageFile, validateOutputFormat } from "@/lib/api/validation"
import { createErrorResponse, handleApiError } from "@/lib/api/errorHandler"
import { validateOrigin, addCorsHeaders, forbiddenOriginResponse } from "@/lib/api/cors"
import { checkRateLimit, rateLimitResponse } from "@/lib/api/rateLimit"

export async function OPTIONS(request) {
    const { valid, origin } = validateOrigin(request)
    if (!valid) return forbiddenOriginResponse()
    return addCorsHeaders(new Response(null, { status: 204 }), origin)
}

export async function POST(request) {
    // CORS check
    const { valid: originValid, origin } = validateOrigin(request)
    if (!originValid) return forbiddenOriginResponse()

    // Rate limit check
    const rateCheck = checkRateLimit(request)
    if (!rateCheck.allowed) return rateLimitResponse(rateCheck.resetIn)

    try {
        const formData = await request.formData()
        const file = formData.get("file")
        const format = formData.get("format") || "webp"
        const quality = parseInt(formData.get("quality") || "80")

        const fileValidation = validateImageFile(file)
        if (!fileValidation.valid) return createErrorResponse(fileValidation.error, 400)

        const formatValidation = validateOutputFormat(format)
        if (!formatValidation.valid) return createErrorResponse(formatValidation.error, 400)

        const buffer = Buffer.from(await file.arrayBuffer())

        let pipeline = sharp(buffer)

        switch (format) {
            case "png":
                pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 10) })
                break
            case "jpeg":
                pipeline = pipeline.jpeg({ quality })
                break
            case "webp":
                pipeline = pipeline.webp({ quality })
                break
        }

        const outputBuffer = await pipeline.toBuffer()
        const mimeType = `image/${format === "jpg" ? "jpeg" : format}`

        const response = new Response(outputBuffer, {
            headers: {
                "Content-Type": mimeType,
                "Content-Disposition": `attachment; filename="converted.${format}"`,
                "Content-Length": outputBuffer.length.toString(),
            },
        })

        return addCorsHeaders(response, origin)
    } catch (error) {
        return handleApiError(error)
    }
}
