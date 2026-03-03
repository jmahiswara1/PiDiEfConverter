"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileType2, ArrowRight, AlertTriangle, FileText, ArrowLeftRight } from "lucide-react"
import { DropZone } from "@/components/converter/DropZone"
import { ProcessingStatus } from "@/components/converter/ProcessingStatus"
import { ConversionResult } from "@/components/converter/ConversionResult"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { downloadBlob, formatFileSize } from "@/lib/fileUtils"
import { DOCS_ACCEPT, PDF_ACCEPT } from "@/lib/constants"
import { cx } from "@/lib/utils"

const TABS = [
    { id: "docs-to-pdf", label: "Docs to PDF", icon: FileType2 },
    { id: "pdf-to-docs", label: "PDF to Docs", icon: ArrowLeftRight },
]

function DocsToPdfTab() {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const { toast } = useToast()

    const handleReset = () => { setFile(null); setStatus("idle"); setProgress(0); setResult(null) }

    const handleConvert = async () => {
        if (!file) return
        setStatus("processing")
        setProgress(10)
        try {
            const formData = new FormData()
            formData.append("file", file)
            setProgress(20)
            const response = await fetch("/api/docs-to-pdf", { method: "POST", body: formData })
            setProgress(70)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Server error: ${response.status}`)
            }
            const blob = await response.blob()
            setProgress(90)
            const baseName = file.name.replace(/\.[^/.]+$/, "")
            setProgress(100)
            setResult({ name: `${baseName}.pdf`, size: blob.size, blob })
            setStatus("success")
        } catch (err) {
            toast({ variant: "error", description: err.message || "Conversion failed" })
            setStatus("error")
        }
    }

    const handleDownload = () => {
        if (result?.blob) {
            downloadBlob(result.blob, result.name)
            toast({ variant: "success", description: `Downloaded ${result.name}` })
        }
    }

    return (
        <AnimatePresence mode="wait">
            {(status === "idle" || status === "error") && !file && (
                <motion.div key="d2p-drop" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <DropZone onFilesAccepted={(f) => setFile(f[0])} title="Upload Document" description="Drag and drop a DOCX, XLSX, or PPTX file" accept={DOCS_ACCEPT} />
                </motion.div>
            )}
            {(status === "idle" || status === "error") && file && (
                <motion.div key="d2p-confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-card border border-surface-border bg-surface p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent"><FileType2 size={32} /></div>
                        <div>
                            <p className="font-mono text-sm text-accent mb-1">{file.name}</p>
                            <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={handleConvert} variant="primary" className="group">Convert to PDF<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
                            <Button onClick={handleReset} variant="outline">Cancel</Button>
                        </div>
                    </div>
                </motion.div>
            )}
            {status === "processing" && (
                <motion.div key="d2p-proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProcessingStatus progress={progress} statusText="Converting document to PDF..." />
                </motion.div>
            )}
            {status === "success" && result && (
                <motion.div key="d2p-done" className="max-w-2xl mx-auto">
                    <ConversionResult fileName={result.name} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function PdfToDocsTab() {
    const [file, setFile] = useState(null)
    const [outputFormat, setOutputFormat] = useState("docx")
    const [status, setStatus] = useState("idle")
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const { toast } = useToast()

    const handleReset = () => { setFile(null); setStatus("idle"); setProgress(0); setResult(null) }

    const handleConvert = async () => {
        if (!file) return
        setStatus("processing")
        setProgress(10)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("format", outputFormat)
            setProgress(20)
            const response = await fetch("/api/pdf-to-docs", { method: "POST", body: formData })
            setProgress(70)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Server error: ${response.status}`)
            }
            const blob = await response.blob()
            setProgress(90)
            const baseName = file.name.replace(/\.pdf$/i, "")
            setProgress(100)
            setResult({ name: `${baseName}.${outputFormat}`, size: blob.size, blob })
            setStatus("success")
        } catch (err) {
            toast({ variant: "error", description: err.message || "Conversion failed" })
            setStatus("error")
        }
    }

    const handleDownload = () => {
        if (result?.blob) {
            downloadBlob(result.blob, result.name)
            toast({ variant: "success", description: `Downloaded ${result.name}` })
        }
    }

    return (
        <AnimatePresence mode="wait">
            {(status === "idle" || status === "error") && !file && (
                <motion.div key="p2d-drop" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <DropZone onFilesAccepted={(f) => setFile(f[0])} title="Upload PDF" description="Drag and drop a PDF to convert to DOCX, XLSX, or PPTX" accept={PDF_ACCEPT} />
                </motion.div>
            )}
            {(status === "idle" || status === "error") && file && (
                <motion.div key="p2d-cfg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-card border border-surface-border bg-surface p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent"><FileText size={32} /></div>
                        <div>
                            <p className="font-mono text-sm text-accent mb-1">{file.name}</p>
                            <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                        </div>
                        <div className="space-y-3 w-full max-w-xs">
                            <label className="text-sm font-medium text-text-muted">Output Format</label>
                            <div className="flex gap-2 justify-center">
                                {["docx", "xlsx", "pptx"].map((f) => (
                                    <button key={f} onClick={() => setOutputFormat(f)} className={cx(
                                        "px-4 py-2 rounded-md text-sm font-medium transition-all border",
                                        outputFormat === f ? "bg-accent/10 border-accent text-accent" : "bg-surface border-surface-border text-text-muted hover:text-text"
                                    )}>{f.toUpperCase()}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={handleConvert} variant="primary" className="group">Convert to {outputFormat.toUpperCase()}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
                            <Button onClick={handleReset} variant="outline">Cancel</Button>
                        </div>
                    </div>
                </motion.div>
            )}
            {status === "processing" && (
                <motion.div key="p2d-proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProcessingStatus progress={progress} statusText={`Converting PDF to ${outputFormat.toUpperCase()}...`} />
                </motion.div>
            )}
            {status === "success" && result && (
                <motion.div key="p2d-done" className="max-w-2xl mx-auto">
                    <ConversionResult fileName={result.name} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default function DocumentConverterPage() {
    const [activeTab, setActiveTab] = useState("docs-to-pdf")

    return (
        <div className="container mx-auto px-4 sm:px-8 py-12 md:py-24 max-w-4xl">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-display tracking-tight mb-4">Document Converter</h1>
                <p className="text-text-muted text-lg">
                    Convert between PDF and office documents using professional rendering.
                </p>
            </div>

            <div className="mb-8 flex items-start gap-3 rounded-card border border-warning/20 bg-warning/5 p-4 text-sm text-warning">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Usage Limit Applied</p>
                    <p className="text-warning/70 mt-1">Please use this server-side conversion feature as efficiently as possible due to limited processing quotas.</p>
                </div>
            </div>

            <div className="flex gap-2 mb-8 border-b border-surface-border pb-4">
                {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cx(
                        "relative flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all",
                        activeTab === tab.id ? "bg-accent/10 text-accent border border-accent/30" : "text-text-muted hover:text-text border border-transparent"
                    )}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {activeTab === "docs-to-pdf" && <DocsToPdfTab />}
                {activeTab === "pdf-to-docs" && <PdfToDocsTab />}
            </div>
        </div>
    )
}
