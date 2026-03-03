"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, File, AlertCircle, X, CheckCircle2 } from "lucide-react"
import { cx } from "@/lib/utils"

export function DropZone({
    onFilesAccepted,
    maxFiles = 1,
    maxSize = 10 * 1024 * 1024, // 10MB default
    accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    title = "Drop files here",
    description = "or click to browse",
}) {
    const [isDragActive, setIsDragActive] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
    }

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragActive(false)
            setError(null)

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                validateAndProcessFiles(Array.from(e.dataTransfer.files))
            }
        },
        [maxFiles, maxSize, accept, onFilesAccepted]
    )

    const handleChange = (e) => {
        setError(null)
        if (e.target.files && e.target.files.length > 0) {
            validateAndProcessFiles(Array.from(e.target.files))
        }
    }

    const validateAndProcessFiles = (files) => {
        if (files.length > maxFiles) {
            setError(`Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed.`)
            return
        }

        const validFiles = []

        // Convert accept prop to a flat array of extensions and mime types for basic validation
        const acceptedExtensions = Object.values(accept).flat().map(ext => ext.toLowerCase())
        const acceptedMimeTypes = Object.keys(accept).map(mime => mime.toLowerCase())

        for (const file of files) {
            if (file.size > maxSize) {
                setError(`${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`)
                return
            }

            // Basic validation (can be more robust depending on exact 'accept' structure)
            const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`
            const isExtensionValid = acceptedExtensions.includes(fileExtension)
            const isMimeValid = acceptedMimeTypes.some(type => {
                if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', ''))
                return file.type === type
            })

            if (!isExtensionValid && !isMimeValid) {
                setError(`${file.name} is an unsupported file type.`)
                return
            }

            validFiles.push(file)
        }

        if (validFiles.length > 0) {
            onFilesAccepted(validFiles)
        }
    }

    // Generate a flat string of accepted types for the input element
    const inputAccept = Object.keys(accept).join(",") + "," + Object.values(accept).flat().join(",")

    return (
        <div className="w-full">
            <div
                className={cx(
                    "relative group rounded-card border-2 border-dashed p-10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden min-h-[280px]",
                    isDragActive
                        ? "border-accent bg-accent/5 shadow-[0_0_30px_rgba(192,132,252,0.15)]"
                        : "border-surface-border bg-surface hover:border-text-muted hover:bg-surface-hover"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={inputAccept}
                    multiple={maxFiles > 1}
                    className="hidden"
                    onChange={handleChange}
                />

                {/* Background decorative blob */}
                <AnimatePresence>
                    {isDragActive && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 z-0 bg-accent/5 rounded-card blur-xl"
                        />
                    )}
                </AnimatePresence>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        animate={{
                            y: isDragActive ? -10 : 0,
                            scale: isDragActive ? 1.1 : 1
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cx(
                            "mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                            isDragActive ? "bg-accent/20 text-accent" : "bg-surface-border/50 text-text-muted group-hover:bg-surface-border group-hover:text-text"
                        )}
                    >
                        <UploadCloud size={32} />
                    </motion.div>

                    <h3 className="mb-2 font-display text-2xl font-semibold tracking-tight">{title}</h3>
                    <p className="text-sm text-text-muted max-w-sm">
                        {description}
                    </p>

                    <div className="mt-8 flex gap-2 text-xs font-mono text-text-muted/70">
                        <span>Max file size: {maxSize / (1024 * 1024)}MB</span>
                        <span>•</span>
                        <span>Max files: {maxFiles}</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        className="mt-4 flex items-center gap-2 rounded-md bg-error/10 p-3 text-sm text-error border border-error/20"
                    >
                        <AlertCircle size={16} className="shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
