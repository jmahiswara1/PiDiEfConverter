"use client"

import { useState, useCallback } from "react"
import { readFileAsArrayBuffer, createDownloadUrl, revokeDownloadUrl } from "@/lib/fileUtils"

export function usePdfMerge() {
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const merge = useCallback(async (files) => {
        setStatus("processing")
        setProgress(5)
        setError(null)
        setResult(null)

        try {
            const { PDFDocument } = await import("pdf-lib")
            setProgress(15)

            const mergedPdf = await PDFDocument.create()
            const totalFiles = files.length

            for (let i = 0; i < totalFiles; i++) {
                const arrayBuffer = await readFileAsArrayBuffer(files[i])
                const pdf = await PDFDocument.load(arrayBuffer)
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
                pages.forEach((page) => mergedPdf.addPage(page))
                setProgress(15 + Math.round(((i + 1) / totalFiles) * 70))
            }

            const mergedBytes = await mergedPdf.save()
            setProgress(95)

            const blob = new Blob([mergedBytes], { type: "application/pdf" })

            if (result?.url) {
                revokeDownloadUrl(result.url)
            }

            const url = createDownloadUrl(blob)
            setProgress(100)
            setResult({
                name: "merged.pdf",
                size: blob.size,
                url,
                blob,
                pageCount: mergedPdf.getPageCount(),
            })
            setStatus("success")
        } catch (err) {
            setError(err.message || "PDF merge failed")
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

    return { status, progress, result, error, merge, reset }
}
