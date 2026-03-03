export const IMAGE_FORMATS = [
    { id: "png", label: "PNG", mime: "image/png", ext: ".png" },
    { id: "jpeg", label: "JPEG", mime: "image/jpeg", ext: ".jpg" },
    { id: "webp", label: "WebP", mime: "image/webp", ext: ".webp" },
]

export const IMAGE_ACCEPT = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
}

export const PDF_ACCEPT = {
    "application/pdf": [".pdf"],
}

export const DOCS_ACCEPT = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const MAX_PDF_FILES = 20
