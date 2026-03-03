"use client";

import { motion } from "framer-motion";
import { Shield, Zap, FileJson, SplitSquareHorizontal } from "lucide-react";

const features = [
    {
        title: "100% Client-Side",
        description: "Your files never leave your device. All processing happens securely right here in your browser.",
        icon: Shield,
    },
    {
        title: "PDF Merge & Split",
        description: "Combine multiple documents into one, or extract specific pages with pinpoint precision.",
        icon: SplitSquareHorizontal,
    },
    {
        title: "Image Conversion",
        description: "Convert between JPG, PNG, and WebP instantly while retaining maximum quality.",
        icon: FileJson,
    },
    {
        title: "Lightning Fast",
        description: "No need to wait for uploads or downloads. Conversions are instant, leveraging your device's power.",
        icon: Zap,
    }
];

export function FeaturesGrid() {
    return (
        <section className="py-24 bg-white border-t border-[#e5e7eb]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#1f2937] mb-4">Precision tools for every need</h2>
                    <p className="text-[#6b7280] max-w-xl mx-auto">
                        A comprehensive suite of conversion utilities designed for speed and simplicity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-[#fdfaf6] border border-[#e5e7eb] hover:border-[#8b1616]/30 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#8b1616]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 text-[#8b1616]" />
                            </div>
                            <h3 className="text-xl font-medium text-[#1f2937] mb-3">{feature.title}</h3>
                            <p className="text-[#6b7280] leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
