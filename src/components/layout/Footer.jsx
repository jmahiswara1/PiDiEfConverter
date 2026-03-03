import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t border-surface-border bg-background py-12">
            <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col gap-2 relative">
                    <span className="font-display text-xl tracking-tight text-text">PiDiEf Converter</span>
                    <p className="text-sm text-text-muted max-w-xs">
                        Fast, stateless file conversion. No database, zero logs, complete privacy.
                    </p>
                </div>

                <div className="flex gap-8 text-sm text-text-muted">
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-text">Tools</span>
                        <Link href="/image-converter" className="hover:text-accent transition-colors">Image Converter</Link>
                        <Link href="/pdf-tools" className="hover:text-accent transition-colors">PDF Tools</Link>
                        <Link href="/docs-to-pdf" className="hover:text-accent transition-colors">Docs to PDF</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-text">System</span>
                        <span className="hover:text-accent transition-colors cursor-not-allowed">API Status</span>
                        <span className="hover:text-accent transition-colors cursor-not-allowed">Privacy</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 mt-12 pt-8 border-t border-surface-border/50 text-xs text-text-muted flex justify-between">
                <span>&copy; {new Date().getFullYear()} PiDiEf Converter.</span>
                <span>Made with Next.js & Tailwind</span>
            </div>
        </footer>
    )
}
