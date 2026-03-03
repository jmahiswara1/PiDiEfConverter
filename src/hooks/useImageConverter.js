"use client"

import { useState, useCallback } from "react"
import { readFileAsDataURL, createDownloadUrl, revokeDownloadUrl } from "@/lib/fileUtils"

export function useImageConverter() {
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const convert = useCallback(async (file, targetFormat, quality = 80) => {
        setStatus("processing")
        setProgress(10)
        setError(null)
        setResult(null)

        try {
            const dataUrl = await readFileAsDataURL(file)
            setProgress(30)

            const img = new Image()
            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = () => reject(new Error("Failed to load image"))
                img.src = dataUrl
            })
            setProgress(50)

            const canvas = document.createElement("canvas")
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext("2d")
            ctx.drawImage(img, 0, 0)
            setProgress(70)

            const mimeType = `image/${targetFormat === "jpg" ? "jpeg" : targetFormat}`
            const qualityValue = targetFormat === "png" ? undefined : quality / 100

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (b) => {
                        if (b) resolve(b)
                        else reject(new Error("Canvas conversion failed"))
                    },
                    mimeType,
                    qualityValue
                )
            })
            setProgress(90)

            const ext = targetFormat === "jpeg" ? "jpg" : targetFormat
            const baseName = file.name.replace(/\.[^/.]+$/, "")
            const outputName = `${baseName}.${ext}`

            if (result?.url) {
                revokeDownloadUrl(result.url)
            }

            const url = createDownloadUrl(blob)
            setProgress(100)
            setResult({ name: outputName, size: blob.size, url, blob })
            setStatus("success")
        } catch (err) {
            setError(err.message || "Conversion failed")
            setStatus("error")
        }
    }, [result])

    const reset = useCallback(() => {
        if (result?.url) {
            revokeDownloadUrl(result.url)
        }
        setStatus("idle")
        setProgress(0)
        setResult(null)
        setError(null)
    }, [result])

    return { status, progress, result, error, convert, reset }
}
