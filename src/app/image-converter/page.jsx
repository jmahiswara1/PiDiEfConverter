"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ImageIcon, Settings2, FileUp, ArrowLeftRight } from "lucide-react"
import { DropZone } from "@/components/converter/DropZone"
import { ProcessingStatus } from "@/components/converter/ProcessingStatus"
import { ConversionResult } from "@/components/converter/ConversionResult"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { useImageConverter } from "@/hooks/useImageConverter"
import { useImageToPdf } from "@/hooks/useImageToPdf"
import { useToast } from "@/components/ui/Toast"
import { downloadBlob, formatFileSize } from "@/lib/fileUtils"
import { IMAGE_FORMATS, IMAGE_ACCEPT } from "@/lib/constants"
import { cx } from "@/lib/utils"

const TABS = [
    { id: "convert", label: "Format Shift", icon: ArrowLeftRight },
    { id: "to-pdf", label: "Image to PDF", icon: FileUp },
]

function FormatShiftTab() {
    const [file, setFile] = useState(null)
    const [targetFormat, setTargetFormat] = useState("webp")
    const [quality, setQuality] = useState(80)
    const { status, progress, result, error, convert, reset } = useImageConverter()
    const { toast } = useToast()

    useEffect(() => {
        if (error) toast({ variant: "error", description: error })
    }, [error])

    const handleReset = () => { setFile(null); reset() }

    const handleConvert = () => {
        if (!file) return
        convert(file, targetFormat, quality)
    }

    const handleDownload = () => {
        if (result?.blob && result?.name) {
            downloadBlob(result.blob, result.name)
            toast({ variant: "success", description: `Downloaded ${result.name}` })
        }
    }

    return (
        <AnimatePresence mode="wait">
            {status === "idle" && !file && (
                <motion.div key="dropzone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <DropZone onFilesAccepted={(f) => setFile(f[0])} title="Upload Image" description="Drag and drop a PNG, JPEG, or WebP file" accept={IMAGE_ACCEPT} />
                </motion.div>
            )}

            {(status === "idle" || status === "error") && file && (
                <motion.div key="config" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="grid gap-6 md:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader className="border-b border-surface-border/50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ImageIcon size={18} className="text-accent" />Source File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 flex-1 flex flex-col justify-center">
                            <div className="text-center">
                                <div className="font-mono text-xs text-accent mb-2 uppercase break-all">{file.name}</div>
                                <div className="text-sm text-text-muted">{formatFileSize(file.size)}</div>
                                <Button variant="ghost" size="sm" onClick={handleReset} className="mt-4 text-xs">Choose different file</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="border-b border-surface-border/50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings2 size={18} className="text-accent" />Output Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-text-muted">Target Format</label>
                                <div className="flex flex-wrap gap-2">
                                    {IMAGE_FORMATS.map((fmt) => (
                                        <button key={fmt.id} onClick={() => setTargetFormat(fmt.id)} className={cx(
                                            "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border",
                                            targetFormat === fmt.id ? "bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(192,132,252,0.2)]" : "bg-surface border-surface-border text-text-muted hover:border-text-muted hover:text-text"
                                        )}>{fmt.label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <label className="font-medium text-text-muted">Quality</label>
                                    <span className="font-mono text-accent">{quality}%</span>
                                </div>
                                <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-full accent-accent h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div className="pt-4 mt-4 border-t border-surface-border/50">
                                <Button onClick={handleConvert} variant="primary" className="w-full group">
                                    Convert to {targetFormat.toUpperCase()}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {status === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProcessingStatus progress={progress} statusText={`Converting to ${targetFormat.toUpperCase()}...`} />
                </motion.div>
            )}

            {status === "success" && result && (
                <motion.div key="success" className="max-w-2xl mx-auto">
                    <ConversionResult fileName={result.name} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function ImageToPdfTab() {
    const [files, setFiles] = useState([])
    const { status, progress, result, error, convert, reset } = useImageToPdf()
    const { toast } = useToast()

    useEffect(() => {
        if (error) toast({ variant: "error", description: error })
    }, [error])

    const handleReset = () => { setFiles([]); reset() }

    const handleConvert = () => {
        if (files.length === 0) return
        convert(files)
    }

    const handleDownload = () => {
        if (result?.blob) {
            downloadBlob(result.blob, result.name)
            toast({ variant: "success", description: `Downloaded ${result.name}` })
        }
    }

    return (
        <AnimatePresence mode="wait">
            {status === "idle" && (
                <motion.div key="img-pdf-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                    <DropZone
                        onFilesAccepted={(f) => setFiles((prev) => [...prev, ...f].slice(0, 20))}
                        maxFiles={20}
                        title="Upload Images"
                        description="Drag and drop PNG, JPEG, or WebP images to combine into a PDF"
                        accept={IMAGE_ACCEPT}
                    />
                    {files.length > 0 && (
                        <Card>
                            <CardHeader className="border-b border-surface-border/50 pb-4">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span>{files.length} image{files.length > 1 ? "s" : ""} selected</span>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">Clear all</Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                {files.map((f, i) => (
                                    <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 p-3 rounded-md bg-surface-hover/50 border border-surface-border/30">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <ImageIcon size={14} className="text-accent shrink-0" />
                                            <span className="text-sm font-mono truncate">{f.name}</span>
                                            <span className="text-xs text-text-muted shrink-0">{formatFileSize(f.size)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-surface-border/50">
                                    <Button onClick={handleConvert} variant="primary" className="w-full group">
                                        Create PDF ({files.length} page{files.length > 1 ? "s" : ""})
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            )}

            {status === "processing" && (
                <motion.div key="img-pdf-processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProcessingStatus progress={progress} statusText="Creating PDF from images..." />
                </motion.div>
            )}

            {status === "success" && result && (
                <motion.div key="img-pdf-success" className="max-w-2xl mx-auto">
                    <ConversionResult fileName={result.name} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default function ImageConverterPage() {
    const [activeTab, setActiveTab] = useState("convert")

    return (
        <div className="container mx-auto px-4 sm:px-8 py-12 md:py-24 max-w-4xl">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-display tracking-tight mb-4">Image Converter</h1>
                <p className="text-text-muted text-lg">
                    Transform images instantly. Lossless compression, format shifting, and full privacy.
                </p>
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
                {activeTab === "convert" && <FormatShiftTab />}
                {activeTab === "to-pdf" && <ImageToPdfTab />}
            </div>
        </div>
    )
}
