"use client"

import { useState, useCallback } from "react"
import { readFileAsArrayBuffer, createDownloadUrl, revokeDownloadUrl } from "@/lib/fileUtils"

export function usePdfSplit() {
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)
    const [pageCount, setPageCount] = useState(0)

    const loadPdf = useCallback(async (file) => {
        setError(null)
        try {
            const { PDFDocument } = await import("pdf-lib")
            const arrayBuffer = await readFileAsArrayBuffer(file)
            const pdf = await PDFDocument.load(arrayBuffer)
            setPageCount(pdf.getPageCount())
            return pdf.getPageCount()
        } catch (err) {
            setError(err.message || "Failed to load PDF")
            return 0
        }
    }, [])

    const split = useCallback(async (file, ranges) => {
        setStatus("processing")
        setProgress(5)
        setError(null)
        setResults([])

        try {
            const { PDFDocument } = await import("pdf-lib")
            setProgress(10)

            const arrayBuffer = await readFileAsArrayBuffer(file)
            const sourcePdf = await PDFDocument.load(arrayBuffer)
            setProgress(20)

            const totalRanges = ranges.length
            const outputFiles = []
            const baseName = file.name.replace(/\.pdf$/i, "")

            for (let i = 0; i < totalRanges; i++) {
                const range = ranges[i]
                const newPdf = await PDFDocument.create()
                const pageIndices = []

                for (let p = range.start - 1; p < range.end; p++) {
                    if (p >= 0 && p < sourcePdf.getPageCount()) {
                        pageIndices.push(p)
                    }
                }

                const pages = await newPdf.copyPages(sourcePdf, pageIndices)
                pages.forEach((page) => newPdf.addPage(page))

                const pdfBytes = await newPdf.save()
                const blob = new Blob([pdfBytes], { type: "application/pdf" })
                const url = createDownloadUrl(blob)

                outputFiles.push({
                    name: `${baseName}_pages_${range.start}-${range.end}.pdf`,
                    size: blob.size,
                    url,
                    blob,
                    pageCount: newPdf.getPageCount(),
                })

                setProgress(20 + Math.round(((i + 1) / totalRanges) * 75))
            }

            setProgress(100)
            setResults(outputFiles)
            setStatus("success")
        } catch (err) {
            setError(err.message || "PDF split failed")
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

    return { status, progress, results, error, pageCount, loadPdf, split, reset }
}
