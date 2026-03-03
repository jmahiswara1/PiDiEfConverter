const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]
const ALLOWED_DOC_TYPES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]
const MAX_SIZE = 10 * 1024 * 1024

export function validateImageFile(file) {
    if (!file) return { valid: false, error: "No file provided" }
    if (file.size > MAX_SIZE) return { valid: false, error: `File exceeds ${MAX_SIZE / 1024 / 1024}MB limit` }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { valid: false, error: "Unsupported image type" }
    return { valid: true }
}

export function validateDocFile(file) {
    if (!file) return { valid: false, error: "No file provided" }
    if (file.size > MAX_SIZE) return { valid: false, error: `File exceeds ${MAX_SIZE / 1024 / 1024}MB limit` }
    if (!ALLOWED_DOC_TYPES.includes(file.type)) return { valid: false, error: "Unsupported document type. Accepted: DOCX, XLSX, PPTX" }
    return { valid: true }
}

export function validateOutputFormat(format) {
    const allowed = ["png", "jpeg", "webp"]
    if (!allowed.includes(format)) return { valid: false, error: `Invalid format. Allowed: ${allowed.join(", ")}` }
    return { valid: true }
}
