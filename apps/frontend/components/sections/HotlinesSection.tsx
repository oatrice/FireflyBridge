"use client";

import { useState, useEffect } from "react";
import type { Hotline } from "@/lib/types";

interface HotlinesSectionProps {
    hotlines: Hotline[];
    loading: boolean;
}

export default function HotlinesSection({ hotlines, loading }: HotlinesSectionProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ยอดฮิต");
    const [hotlinePage, setHotlinePage] = useState(1);

    // Reset hotline page when filters change
    useEffect(() => {
        setHotlinePage(1);
    }, [searchTerm, selectedCategory]);

    if (loading) {
        return (
            <section id="hotlines" className="mt-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    📞 เบอร์โทรฉุกเฉิน (Emergency Hotlines)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-40 bg-white rounded-2xl shadow-sm animate-pulse"
                        ></div>
                    ))}
                </div>
            </section>
        );
    }

    // Filter hotlines
    const filteredHotlines = hotlines.filter((hotline: any) => {
        const matchesSearch =
            hotline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (hotline.number && hotline.number.includes(searchTerm)) ||
            (hotline.numbers && hotline.numbers.some((n: string) => n.includes(searchTerm))) ||
            hotline.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" ||
            (selectedCategory === "ยอดฮิต" && hotline.isPopular) ||
            hotline.category === selectedCategory ||
            (hotline.categories && hotline.categories.includes(selectedCategory));
        return matchesSearch && matchesCategory;
    }).sort((a: any, b: any) => {
        // Sort by displayOrder for popular hotlines, otherwise by id
        if (selectedCategory === "ยอดฮิต") {
            return (a.displayOrder || 0) - (b.displayOrder || 0);
        }
        return (a.id || 0) - (b.id || 0);
    });

    // Pagination Logic
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredHotlines.length / itemsPerPage);
    const startIndex = (hotlinePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHotlines = filteredHotlines.slice(startIndex, endIndex);

    // Extract all categories
    const allCategoriesSet = new Set<string>();
    hotlines.forEach((h: any) => {
        allCategoriesSet.add(h.category);
        if (h.categories) {
            h.categories.forEach((cat: string) => allCategoriesSet.add(cat));
        }
    });
    const allCategories = Array.from(allCategoriesSet);
    const priorityCategories = ["ทั้งหมด", "ยอดฮิต", "มูลนิธิ", "อาสาสมัคร", "ท้องถิ่น"];
    const otherCategories = allCategories.filter((cat) => !priorityCategories.includes(cat));
    const orderedCategories = [...priorityCategories, ...otherCategories];

    return (
        <section id="hotlines" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                📞 เบอร์โทรฉุกเฉิน (Emergency Hotlines)
            </h2>

            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ค้นหาเบอร์โทร, หน่วยงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-neutral-900 placeholder-neutral-400 shadow-sm"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                        🔍
                    </span>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {orderedCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category === "ทั้งหมด" ? "All" : category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${(category === "ทั้งหมด" && selectedCategory === "All") ||
                                selectedCategory === category
                                ? "bg-blue-600 text-white"
                                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* No Results */}
            {filteredHotlines.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">ไม่พบข้อมูล</h3>
                    <p className="text-neutral-500 text-center max-w-md">
                        ไม่พบเบอร์โทรที่ตรงกับคำค้นหา "{searchTerm}"
                        {selectedCategory !== "All" && ` ในหมวด "${selectedCategory}"`}
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All");
                            setHotlinePage(1);
                        }}
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        ล้างการค้นหา
                    </button>
                </div>
            )}

            {/* Hotline Cards */}
            {filteredHotlines.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedHotlines.map((hotline) => (
                            <div
                                key={hotline.id}
                                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 hover:border-neutral-200"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${hotline.color}`}
                                    >
                                        {hotline.category}
                                    </span>
                                </div>

                                {/* Phone Number Display Logic */}
                                {hotline.numbers && hotline.numbers.length > 0 ? (
                                    <div className="mb-2 space-y-1">
                                        {hotline.numbers.map((num, idx) => (
                                            <a
                                                key={idx}
                                                href={`tel:${num}`}
                                                className="flex items-center gap-2 group w-fit hover:opacity-80 transition-opacity"
                                                title={`Call ${num}`}
                                            >
                                                <h3 className="text-xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                                                    {num}
                                                </h3>
                                                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors text-sm">
                                                    📞
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                ) : hotline.number ? (
                                    <a
                                        href={`tel:${hotline.number}`}
                                        className="flex items-center gap-2 group w-fit mb-2 hover:opacity-80 transition-opacity"
                                        title={`Call ${hotline.name}`}
                                    >
                                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                                            {hotline.number}
                                        </h3>
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors text-sm">
                                            📞
                                        </span>
                                    </a>
                                ) : null}

                                <p className="text-neutral-800 font-medium mb-2">{hotline.name}</p>
                                <p className="text-neutral-500 text-sm mb-3">{hotline.description}</p>

                                {/* Social Links */}
                                {hotline.links && (
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100">
                                        {hotline.links.facebook && (
                                            <a
                                                href={hotline.links.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                                                title="Facebook"
                                            >
                                                <span>👥</span>
                                                <span>FB</span>
                                            </a>
                                        )}
                                        {hotline.links.website && (
                                            <a
                                                href={hotline.links.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-medium transition-colors"
                                                title="Website"
                                            >
                                                <span>🌐</span>
                                                <span>Web</span>
                                            </a>
                                        )}
                                        {hotline.links.line && (
                                            <a
                                                href={hotline.links.line}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition-colors"
                                                title="LINE"
                                            >
                                                <span>💬</span>
                                                <span>LINE</span>
                                            </a>
                                        )}
                                        {hotline.links.instagram &&
                                            hotline.links.instagram.map((igLink, idx) => (
                                                <a
                                                    key={idx}
                                                    href={igLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg text-xs font-medium transition-colors"
                                                    title="Instagram"
                                                >
                                                    <span>📸</span>
                                                    <span>IG</span>
                                                </a>
                                            ))}
                                        {hotline.links.youtube && (
                                            <a
                                                href={
                                                    hotline.links.youtube.startsWith("http")
                                                        ? hotline.links.youtube
                                                        : `https://${hotline.links.youtube}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                                                title="YouTube"
                                            >
                                                <span>▶️</span>
                                                <span>YT</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                            <div className="text-sm text-neutral-600">
                                แสดง {startIndex + 1}-{Math.min(endIndex, filteredHotlines.length)} จาก{" "}
                                {filteredHotlines.length} รายการ
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setHotlinePage((prev) => Math.max(1, prev - 1))}
                                    disabled={hotlinePage === 1}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${hotlinePage === 1
                                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                        : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                >
                                    ← ก่อนหน้า
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= hotlinePage - 1 && page <= hotlinePage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setHotlinePage(page)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${hotlinePage === page
                                                        ? "bg-blue-600 text-white shadow-md"
                                                        : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === hotlinePage - 2 || page === hotlinePage + 2) {
                                            return (
                                                <span key={page} className="px-2 text-neutral-400">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setHotlinePage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={hotlinePage === totalPages}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${hotlinePage === totalPages
                                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                        : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                >
                                    ถัดไป →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
