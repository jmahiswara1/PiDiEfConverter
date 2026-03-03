"use client"

import { useState, useCallback } from "react"
import { readFileAsArrayBuffer, createDownloadUrl, revokeDownloadUrl } from "@/lib/fileUtils"

export function useImageToPdf() {
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const convert = useCallback(async (files) => {
        setStatus("processing")
        setProgress(5)
        setError(null)
        setResult(null)

        try {
            const { PDFDocument } = await import("pdf-lib")
            setProgress(15)

            const pdfDoc = await PDFDocument.create()
            const totalFiles = files.length

            for (let i = 0; i < totalFiles; i++) {
                const file = files[i]
                const arrayBuffer = await readFileAsArrayBuffer(file)
                const uint8 = new Uint8Array(arrayBuffer)

                let image
                if (file.type === "image/png") {
                    image = await pdfDoc.embedPng(uint8)
                } else if (file.type === "image/jpeg") {
                    image = await pdfDoc.embedJpg(uint8)
                } else {
                    const canvas = document.createElement("canvas")
                    const img = new Image()
                    await new Promise((resolve, reject) => {
                        img.onload = resolve
                        img.onerror = () => reject(new Error("Failed to load image"))
                        img.src = URL.createObjectURL(file)
                    })
                    canvas.width = img.naturalWidth
                    canvas.height = img.naturalHeight
                    const ctx = canvas.getContext("2d")
                    ctx.drawImage(img, 0, 0)
                    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
                    const pngBuffer = await pngBlob.arrayBuffer()
                    image = await pdfDoc.embedPng(new Uint8Array(pngBuffer))
                    URL.revokeObjectURL(img.src)
                }

                const { width, height } = image.scale(1)
                const page = pdfDoc.addPage([width, height])
                page.drawImage(image, { x: 0, y: 0, width, height })

                setProgress(15 + Math.round(((i + 1) / totalFiles) * 70))
            }

            const pdfBytes = await pdfDoc.save()
            setProgress(95)

            const blob = new Blob([pdfBytes], { type: "application/pdf" })

            if (result?.url) revokeDownloadUrl(result.url)

            const url = createDownloadUrl(blob)
            setProgress(100)
            setResult({
                name: "images.pdf",
                size: blob.size,
                url,
                blob,
                pageCount: pdfDoc.getPageCount(),
            })
            setStatus("success")
        } catch (err) {
            setError(err.message || "Image to PDF conversion failed")
            setStatus("error")
        }
    }, [result])

    const reset = useCallback(() => {
        if (result?.url) revokeDownloadUrl(result.url)
        setStatus("idle")
        setProgress(0)
        setResult(null)
        setError(null)
    }, [result])

    return { status, progress, result, error, convert, reset }
}
