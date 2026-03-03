import { motion } from "framer-motion"
import { Download, RotateCcw, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function ConversionResult({ fileName, fileSize, onDownload, onReset }) {
    // Format bytes to human readable
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full relative overflow-hidden rounded-card border border-success/30 bg-surface p-8 shadow-glass"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
                    <FileCheck size={32} />
                </div>

                <div className="space-y-1">
                    <h3 className="font-display text-2xl font-semibold tracking-tight">Conversion Complete</h3>
                    <p className="text-sm text-text-muted">
                        {fileName} ({formatSize(fileSize)}) ready for download.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    <Button variant="primary" onClick={onDownload} className="min-w-[160px]">
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                    </Button>
                    <Button variant="outline" onClick={onReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Convert Another
                    </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-border w-full text-xs text-text-muted font-mono flex justify-center items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                    Stateless processing: File has been purged from memory.
                </div>
            </div>
        </motion.div>
    )
}
