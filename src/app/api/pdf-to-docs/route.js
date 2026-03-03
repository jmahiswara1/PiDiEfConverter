import { validateDocFile } from "@/lib/api/validation"
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
        const apiKey = process.env.CLOUDCONVERT_API_KEY
        if (!apiKey) {
            return createErrorResponse("CloudConvert API key not configured", 503)
        }

        const formData = await request.formData()
        const file = formData.get("file")
        const outputFormat = formData.get("format") || "docx"

        if (!file) return createErrorResponse("No file provided", 400)
        if (file.size > 10 * 1024 * 1024) return createErrorResponse("File exceeds 10MB limit", 400)

        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const base64Data = fileBuffer.toString("base64")
        const fileName = file.name || "document.pdf"

        const apiUrl = process.env.CLOUDCONVERT_API_URL || "https://sync.api.cloudconvert.com/v2/jobs"

        const jobPayload = {
            tasks: {
                "import-file": {
                    operation: "import/base64",
                    file: base64Data,
                    filename: fileName,
                },
                "convert-file": {
                    operation: "convert",
                    input: "import-file",
                    input_format: "pdf",
                    output_format: outputFormat,
                },
                "export-file": {
                    operation: "export/url",
                    input: "convert-file",
                },
            },
        }

        const jobResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jobPayload),
        })

        if (!jobResponse.ok) {
            const errBody = await jobResponse.text()
            return createErrorResponse(`CloudConvert error: ${errBody}`, jobResponse.status)
        }

        const jobData = await jobResponse.json()
        const exportTask = jobData.data?.tasks?.find(
            (t) => t.operation === "export/url" && t.status === "finished"
        )

        if (!exportTask?.result?.files?.[0]?.url) {
            return createErrorResponse("Conversion completed but no download URL received", 502)
        }

        const downloadUrl = exportTask.result.files[0].url
        const docResponse = await fetch(downloadUrl)

        if (!docResponse.ok) {
            return createErrorResponse("Failed to download converted file", 502)
        }

        const docBuffer = await docResponse.arrayBuffer()
        const mimeMap = {
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        }

        const response = new Response(docBuffer, {
            headers: {
                "Content-Type": mimeMap[outputFormat] || "application/octet-stream",
                "Content-Disposition": `attachment; filename="${fileName.replace(/\.pdf$/i, "")}.${outputFormat}"`,
                "Content-Length": docBuffer.byteLength.toString(),
            },
        })

        return addCorsHeaders(response, origin)
    } catch (error) {
        return handleApiError(error)
    }
}
