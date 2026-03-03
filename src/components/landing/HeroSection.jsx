"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, Image, ShieldCheck } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-[#fdfaf6] text-[#1f2937] px-6">
            {/* Decorative background blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-[#8b1616]/5 blur-[120px] rounded-full point-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-7xl font-serif leading-tight tracking-tight mb-6"
                >
                    Convert files <span className="text-[#8b1616] italic">securely</span><br className="hidden md:block" />
                    in your browser.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg md:text-xl text-[#6b7280] max-w-2xl mx-auto mb-10"
                >
                    Merge PDFs, split pages, and convert image formats with zero server uploads.
                    Professional precision, absolute privacy.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/pdf-tools" className="group flex items-center gap-2 bg-[#8b1616] text-[#fdfaf6] px-8 py-4 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 w-full sm:w-[220px] justify-center">
                        <FileText className="w-5 h-5" />
                        PDF Tools
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/image-converter" className="group flex items-center gap-2 bg-white text-[#1f2937] border border-[#e5e7eb] px-8 py-4 rounded-full font-medium transition-all hover:border-[#8b1616]/30 hover:bg-[#8b1616]/5 active:scale-95 w-full sm:w-[220px] justify-center shadow-sm">
                        <Image className="w-5 h-5" />
                        Image Converter
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
