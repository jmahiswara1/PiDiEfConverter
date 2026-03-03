"use client"

import { useState, useCallback } from "react"
import { readFileAsArrayBuffer, createDownloadUrl, revokeDownloadUrl } from "@/lib/fileUtils"

async function loadPdfJs() {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js")
    const lib = pdfjsLib.default || pdfjsLib
    if (lib.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`
    }
    return lib
}

export function usePdfToImage() {
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)
    const [pageCount, setPageCount] = useState(0)

    const convert = useCallback(async (file, format = "png", scale = 2) => {
        setStatus("processing")
        setProgress(5)
        setError(null)
        setResults([])

        try {
            const pdfjsLib = await loadPdfJs()
            setProgress(15)

            const arrayBuffer = await readFileAsArrayBuffer(file)
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            const total = pdf.numPages
            setPageCount(total)
            setProgress(20)

            const outputFiles = []
            const baseName = file.name.replace(/\.pdf$/i, "")
            const mimeType = format === "jpeg" ? "image/jpeg" : "image/png"

            for (let i = 1; i <= total; i++) {
                const page = await pdf.getPage(i)
                const viewport = page.getViewport({ scale })

                const canvas = document.createElement("canvas")
                canvas.width = viewport.width
                canvas.height = viewport.height
                const ctx = canvas.getContext("2d")

                await page.render({ canvasContext: ctx, viewport }).promise

                const blob = await new Promise((resolve) =>
                    canvas.toBlob(resolve, mimeType, format === "jpeg" ? 0.92 : undefined)
                )

                const ext = format === "jpeg" ? "jpg" : format
                const url = createDownloadUrl(blob)

                outputFiles.push({
                    name: `${baseName}_page_${i}.${ext}`,
                    size: blob.size,
                    url,
                    blob,
                    pageNumber: i,
                })

                setProgress(20 + Math.round((i / total) * 75))
            }

            setProgress(100)
            setResults(outputFiles)
            setStatus("success")
        } catch (err) {
            setError(err.message || "PDF to Image conversion failed")
            setStatus("error")
        }
    }, [])

    const reset = useCallback(() => {
        results.forEach((r) => {
            if (r?.url) revokeDownloadUrl(r.url)
        })
        setStatus("idle")
        setProgress(0)
        setResults([])
        setError(null)
        setPageCount(0)
    }, [results])

    return { status, progress, results, error, pageCount, convert, reset }
}
