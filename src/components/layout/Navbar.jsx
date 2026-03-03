"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Image as ImageIcon, FileDiff, FileType2 } from "lucide-react"
import { cx } from "@/lib/utils"

const navItems = [
    { href: "/image-converter", label: "Image Converter", icon: ImageIcon },
    { href: "/pdf-tools", label: "PDF Tools", icon: FileDiff },
    { href: "/docs-to-pdf", label: "Docs to PDF", icon: FileType2 },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/logo.png"
                        alt="PiDiEf Converter Logo"
                        width={32}
                        height={32}
                        className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="font-sans font-bold text-xl tracking-tight">PiDiEf Converter</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cx(
                                    "relative px-3 py-2 text-sm transition-colors",
                                    isActive ? "text-text" : "text-text-muted hover:text-text"
                                )}
                            >
                                <div className="flex items-center gap-2 relative z-10">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-active"
                                        className="absolute inset-0 rounded-md bg-surface border border-surface-border text-text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
