import { motion } from "framer-motion"
import { cx } from "@/lib/utils"

export function ProcessingStatus({ progress, statusText = "Processing..." }) {
    return (
        <div className="w-full flex justify-center py-10">
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-border">
                    <motion.div
                        className="absolute bottom-0 left-0 top-0 bg-accent"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                    />
                </div>
                <div className="flex w-full justify-between text-xs font-mono text-text-muted">
                    <span>{statusText}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-8 flex gap-2">
                    {/* Brutalist loading dots */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="h-2 w-2 bg-text border border-surface-border"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="h-2 w-2 bg-text border border-surface-border"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="h-2 w-2 bg-text border border-surface-border"
                    />
                </div>
            </div>
        </div>
    )
}
