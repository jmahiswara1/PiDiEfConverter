const activeUrls = new Set()

export function createDownloadUrl(blob) {
    const url = URL.createObjectURL(blob)
    activeUrls.add(url)
    return url
}

export function revokeDownloadUrl(url) {
    URL.revokeObjectURL(url)
    activeUrls.delete(url)
}

export function revokeAllUrls() {
    activeUrls.forEach((url) => URL.revokeObjectURL(url))
    activeUrls.clear()
}

export function triggerDownload(url, filename) {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function downloadBlob(blob, filename) {
    const url = createDownloadUrl(blob)
    triggerDownload(url, filename)
    setTimeout(() => revokeDownloadUrl(url), 30000)
}

export function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(file)
    })
}

export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

export function formatFileSize(bytes) {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
