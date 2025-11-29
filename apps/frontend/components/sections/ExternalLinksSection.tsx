"use client";

import { useState } from "react";
import type { ExternalLink } from "@/lib/types";

interface ExternalLinksSectionProps {
    externalLinks: ExternalLink[];
    loading: boolean;
}

export default function ExternalLinksSection({ externalLinks, loading }: ExternalLinksSectionProps) {
    const [showAllLinks, setShowAllLinks] = useState(false);

    if (loading) {
        return (
            <section id="external" className="mt-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    🔗 แพลตฟอร์มภายนอก (External Rescue Platforms)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"
                        ></div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section id="external" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                🔗 แพลตฟอร์มภายนอก (External Rescue Platforms)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(showAllLinks ? externalLinks : externalLinks.slice(0, 6)).map((link, i) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 hover:border-blue-200 hover:bg-blue-50/30 ${i >= 6 ? "animate-fade-in-up" : ""
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">{link.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {link.name}
                                </h3>
                                <p className="text-neutral-600 text-sm mb-2">
                                    {link.description}
                                </p>
                                <div className="flex items-center text-blue-600 text-sm font-medium">
                                    <span>เปิดดูข้อมูล</span>
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {externalLinks.length > 6 && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => {
                            if (showAllLinks) {
                                document.getElementById("external")?.scrollIntoView({ behavior: "smooth" });
                            }
                            setShowAllLinks(!showAllLinks);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-full font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <span>{showAllLinks ? "ย่อรายการ" : "ดูทั้งหมด"}</span>
                        <span
                            className={`transform transition-transform duration-300 ${showAllLinks ? "rotate-180" : ""
                                }`}
                        >
                            ▼
                        </span>
                    </button>
                </div>
            )}
        </section>
    );
}
