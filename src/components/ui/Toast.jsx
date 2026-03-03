"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cx } from "@/lib/utils"

const ToastContext = React.createContext({
    toast: () => { },
})

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([])

    const toast = React.useCallback(({ title, description, variant = "default", duration = 5000 }) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, title, description, variant }])

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, duration)
        }
    }, [])

    const removeToast = React.useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <ToastItem key={t.id} {...t} onRemove={() => removeToast(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => React.useContext(ToastContext)

const variants = {
    default: "bg-surface border-surface-border text-text",
    success: "bg-[#092a19] border-[#166534] text-[#34d399]",
    error: "bg-[#2a0909] border-[#991b1b] text-[#f87171]",
}

const icons = {
    default: <Info className="h-5 w-5 opacity-70" />,
    success: <CheckCircle2 className="h-5 w-5 text-[#34d399]" />,
    error: <AlertCircle className="h-5 w-5 text-[#f87171]" />,
}

function ToastItem({ title, description, variant = "default", onRemove }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cx(
                "group relative pointer-events-auto flex w-full items-start gap-4 overflow-hidden rounded-card border p-4 shadow-card-hover transition-all mb-4",
                variants[variant] || variants.default
            )}
        >
            <div className="mt-0.5">{icons[variant] || icons.default}</div>
            <div className="flex-1 space-y-1 pr-6">
                {title && <h3 className="text-sm font-semibold font-display tracking-tight">{title}</h3>}
                {description && <p className="text-sm opacity-90">{description}</p>}
            </div>
            <button
                onClick={onRemove}
                className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </motion.div>
    )
}
