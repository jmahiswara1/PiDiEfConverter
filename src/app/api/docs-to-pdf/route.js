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

        const validation = validateDocFile(file)
        if (!validation.valid) return createErrorResponse(validation.error, 400)

        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const base64Data = fileBuffer.toString("base64")
        const fileName = file.name || "document"
        const inputFormat = fileName.split(".").pop().toLowerCase()

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
                    input_format: inputFormat,
                    output_format: "pdf",
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
        const pdfResponse = await fetch(downloadUrl)

        if (!pdfResponse.ok) {
            return createErrorResponse("Failed to download converted file", 502)
        }

        const pdfBuffer = await pdfResponse.arrayBuffer()

        const response = new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName.replace(/\.[^/.]+$/, "")}.pdf"`,
                "Content-Length": pdfBuffer.byteLength.toString(),
            },
        })

        return addCorsHeaders(response, origin)
    } catch (error) {
        return handleApiError(error)
    }
}
