"use client"

import { useState, useEffect } from "react"
import { Combine, Scissors, Image as ImageIcon, ArrowRight, FileText, Plus, Trash2, GripVertical, Download } from "lucide-react"
import { DropZone } from "@/components/converter/DropZone"
import { ProcessingStatus } from "@/components/converter/ProcessingStatus"
import { ConversionResult } from "@/components/converter/ConversionResult"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { usePdfMerge } from "@/hooks/usePdfMerge"
import { usePdfSplit } from "@/hooks/usePdfSplit"
import { usePdfToImage } from "@/hooks/usePdfToImage"
import { useToast } from "@/components/ui/Toast"
import { downloadBlob, formatFileSize } from "@/lib/fileUtils"
import { PDF_ACCEPT, MAX_PDF_FILES } from "@/lib/constants"
import { cx } from "@/lib/utils"

const TABS = [
    { id: "merge", label: "Merge PDFs", icon: Combine },
    { id: "split", label: "Split PDF", icon: Scissors },
    { id: "to-image", label: "PDF to Image", icon: ImageIcon },
]

function MergeTab() {
    const [files, setFiles] = useState([])
    const { status, progress, result, error, merge, reset } = usePdfMerge()
    const { toast } = useToast()

    useEffect(() => {
        if (error) toast({ variant: "error", description: error })
    }, [error])

    const handleFilesAccepted = (newFiles) => {
        setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_PDF_FILES))
    }
    const handleRemoveFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index))
    const handleReset = () => { setFiles([]); reset() }

    const handleMerge = () => {
        if (files.length < 2) {
            toast({ variant: "error", description: "Select at least 2 PDFs to merge" })
            return
        }
        merge(files)
    }

    const handleDownload = () => {
        if (result?.blob) {
            downloadBlob(result.blob, result.name)
            toast({ variant: "success", description: `Downloaded ${result.name}` })
        }
    }

    if (status === "processing") {
        return <ProcessingStatus progress={progress} statusText="Merging PDFs..." />
    }

    if (status === "success" && result) {
        return (
            <div className="max-w-2xl mx-auto">
                <ConversionResult fileName={result.name} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <DropZone onFilesAccepted={handleFilesAccepted} maxFiles={MAX_PDF_FILES} title="Upload PDF Files" description={`Drag and drop up to ${MAX_PDF_FILES} PDF files to merge`} accept={PDF_ACCEPT} />
            {files.length > 0 && (
                <Card>
                    <CardHeader className="border-b border-surface-border/50 pb-4">
                        <CardTitle className="text-sm flex items-center justify-between">
                            <span>{files.length} file{files.length > 1 ? "s" : ""} selected</span>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">Clear all</Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 p-3 rounded-md bg-surface-hover/50 border border-surface-border/30">
                                <div className="flex items-center gap-3 min-w-0">
                                    <GripVertical size={14} className="text-text-muted shrink-0" />
                                    <FileText size={14} className="text-accent shrink-0" />
                                    <span className="text-sm font-mono truncate">{file.name}</span>
                                    <span className="text-xs text-text-muted shrink-0">{formatFileSize(file.size)}</span>
                                </div>
                                <button onClick={() => handleRemoveFile(index)} className="text-text-muted hover:text-error transition-colors shrink-0 cursor-pointer"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-surface-border/50">
                            <Button onClick={handleMerge} variant="primary" className="w-full group" disabled={files.length < 2}>
                                Merge {files.length} PDFs<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function SplitTab() {
    const [file, setFile] = useState(null)
    const [ranges, setRanges] = useState([{ start: 1, end: 1 }])
    const { status, progress, results, error, pageCount, loadPdf, split, reset } = usePdfSplit()
    const { toast } = useToast()

    useEffect(() => {
        if (error) toast({ variant: "error", description: error })
    }, [error])

    const handleFileAccepted = async (files) => {
        const f = files[0]
        setFile(f)
        const count = await loadPdf(f)
        if (count > 0) setRanges([{ start: 1, end: count }])
    }

    const handleAddRange = () => setRanges((prev) => [...prev, { start: 1, end: pageCount }])
    const handleRemoveRange = (index) => setRanges((prev) => prev.filter((_, i) => i !== index))
    const handleRangeChange = (index, field, value) => {
        setRanges((prev) => prev.map((r, i) => i === index ? { ...r, [field]: Math.max(1, Math.min(pageCount, parseInt(value) || 1)) } : r))
    }
    const handleReset = () => { setFile(null); setRanges([{ start: 1, end: 1 }]); reset() }
    const handleSplit = () => { if (!file || ranges.length === 0) return; split(file, ranges) }

    const handleDownloadResult = (r) => {
        if (r?.blob && r?.name) {
            downloadBlob(r.blob, r.name)
            toast({ variant: "success", description: `Downloaded ${r.name}` })
        }
    }

    if (status === "processing") {
        return <ProcessingStatus progress={progress} statusText="Splitting PDF..." />
    }

    if (status === "success" && results.length > 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-display text-2xl tracking-tight">Split Complete</h3>
                <p className="text-sm text-text-muted">{results.length} file{results.length > 1 ? "s" : ""} created</p>
                {results.map((r, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText size={16} className="text-accent" />
                                <span className="font-mono text-sm">{r.name}</span>
                                <span className="text-xs text-text-muted">{formatFileSize(r.size)} / {r.pageCount} pages</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDownloadResult(r)}
                                className="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium border border-surface-border bg-background hover:bg-surface hover:text-text transition-colors cursor-pointer"
                            >
                                <Download size={14} className="mr-1" /> Download
                            </button>
                        </div>
                    </Card>
                ))}
                <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium hover:bg-surface hover:text-text transition-colors cursor-pointer"
                >
                    Split Another PDF
                </button>
            </div>
        )
    }

    if (!file) {
        return <DropZone onFilesAccepted={handleFileAccepted} title="Upload PDF" description="Drag and drop a PDF file to split" accept={PDF_ACCEPT} />
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="border-b border-surface-border/50 pb-4">
                    <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2"><FileText size={14} className="text-accent" /><span className="font-mono">{file.name}</span></div>
                        <span className="text-text-muted">{pageCount} pages</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-muted">Page Ranges</label>
                        <Button variant="ghost" size="sm" onClick={handleAddRange} className="text-xs"><Plus size={12} className="mr-1" /> Add Range</Button>
                    </div>
                    {ranges.map((range, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <span className="text-xs text-text-muted w-8">#{index + 1}</span>
                            <input type="number" min={1} max={pageCount} value={range.start} onChange={(e) => handleRangeChange(index, "start", e.target.value)} className="w-20 px-3 py-2 text-sm font-mono bg-surface border border-surface-border rounded-md text-text focus:border-accent focus:outline-none" />
                            <span className="text-text-muted text-xs">to</span>
                            <input type="number" min={1} max={pageCount} value={range.end} onChange={(e) => handleRangeChange(index, "end", e.target.value)} className="w-20 px-3 py-2 text-sm font-mono bg-surface border border-surface-border rounded-md text-text focus:border-accent focus:outline-none" />
                            {ranges.length > 1 && <button onClick={() => handleRemoveRange(index)} className="text-text-muted hover:text-error transition-colors cursor-pointer"><Trash2 size={14} /></button>}
                        </div>
                    ))}
                    <div className="pt-4 border-t border-surface-border/50 flex gap-3">
                        <Button onClick={handleSplit} variant="primary" className="flex-1 group">Split PDF<Scissors className="ml-2 h-4 w-4" /></Button>
                        <Button onClick={handleReset} variant="outline">Reset</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PdfToImageTab() {
    const [file, setFile] = useState(null)
    const [format, setFormat] = useState("png")
    const { status, progress, results, error, pageCount, convert, reset } = usePdfToImage()
    const { toast } = useToast()

    useEffect(() => {
        if (error) toast({ variant: "error", description: error })
    }, [error])

    const handleReset = () => { setFile(null); reset() }

    const handleConvert = () => {
        if (!file) return
        convert(file, format)
    }

    const handleDownloadResult = (r) => {
        if (r?.blob && r?.name) {
            downloadBlob(r.blob, r.name)
            toast({ variant: "success", description: `Downloaded ${r.name}` })
        }
    }

    if (status === "processing") {
        return <ProcessingStatus progress={progress} statusText="Rendering pages to images..." />
    }

    if (status === "success" && results.length > 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-display text-2xl tracking-tight">Conversion Complete</h3>
                <p className="text-sm text-text-muted">{results.length} page{results.length > 1 ? "s" : ""} rendered</p>
                {results.map((r, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ImageIcon size={16} className="text-accent" />
                                <span className="font-mono text-sm">{r.name}</span>
                                <span className="text-xs text-text-muted">{formatFileSize(r.size)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDownloadResult(r)}
                                className="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium border border-surface-border bg-background hover:bg-surface hover:text-text transition-colors cursor-pointer"
                            >
                                <Download size={14} className="mr-1" /> Download
                            </button>
                        </div>
                    </Card>
                ))}
                <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium hover:bg-surface hover:text-text transition-colors cursor-pointer"
                >
                    Convert Another PDF
                </button>
            </div>
        )
    }

    if (!file) {
        return <DropZone onFilesAccepted={(f) => setFile(f[0])} title="Upload PDF" description="Drag and drop a PDF to convert each page to an image" accept={PDF_ACCEPT} />
    }

    return (
        <Card>
            <CardHeader className="border-b border-surface-border/50 pb-4">
                <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2"><FileText size={14} className="text-accent" /><span className="font-mono">{file.name}</span></div>
                    <button type="button" onClick={handleReset} className="text-xs text-text-muted hover:text-text transition-colors cursor-pointer">Change file</button>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-text-muted">Output Format</label>
                    <div className="flex gap-2">
                        {["png", "jpeg"].map((f) => (
                            <button key={f} type="button" onClick={() => setFormat(f)} className={cx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all border cursor-pointer",
                                format === f ? "bg-accent/10 border-accent text-accent" : "bg-surface border-surface-border text-text-muted hover:text-text"
                            )}>{f.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
                <Button onClick={handleConvert} variant="primary" className="w-full group">
                    Convert to Images<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardContent>
        </Card>
    )
}

export default function PdfToolsPage() {
    const [activeTab, setActiveTab] = useState("merge")

    return (
        <div className="container mx-auto px-4 sm:px-8 py-12 md:py-24 max-w-4xl">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-display tracking-tight mb-4">PDF Tools</h1>
                <p className="text-text-muted text-lg">
                    Merge, split, and extract images from PDFs entirely in your browser.
                </p>
            </div>

            <div className="flex gap-2 mb-8 border-b border-surface-border pb-4">
                {TABS.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cx(
                        "relative flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                        activeTab === tab.id ? "bg-accent/10 text-accent border border-accent/30" : "text-text-muted hover:text-text border border-transparent"
                    )}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {activeTab === "merge" && <MergeTab />}
                {activeTab === "split" && <SplitTab />}
                {activeTab === "to-image" && <PdfToImageTab />}
            </div>
        </div>
    )
}
