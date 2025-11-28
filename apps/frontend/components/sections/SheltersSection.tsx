"use client";

import { useState, useEffect } from "react";
import type { Shelter } from "@/lib/types";

interface SheltersSectionProps {
    shelters: Shelter[];
    loading: boolean;
}

export default function SheltersSection({ shelters, loading }: SheltersSectionProps) {
    const [shelterSearchTerm, setShelterSearchTerm] = useState("");
    const [selectedArea, setSelectedArea] = useState("ทั้งหมด");
    const [shelterViewMode, setShelterViewMode] = useState<"grid" | "list">("grid");
    const [shelterSortBy, setShelterSortBy] = useState<"name" | "area">("area");
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [shelterSearchTerm, selectedArea, shelterViewMode]);

    if (loading) {
        return (
            <section id="shelters" className="mt-8 scroll-mt-20">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2 flex items-center">
                    🏠 ศูนย์พักพิง (Shelters)
                </h2>
                <p className="text-neutral-600 text-sm mb-6">กำลังโหลด...</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-48 bg-white rounded-2xl shadow-sm animate-pulse"
                        ></div>
                    ))}
                </div>
            </section>
        );
    }

    // Filter shelters
    const filteredShelters = shelters.filter((shelter) => {
        const matchesSearch =
            shelter.name.toLowerCase().includes(shelterSearchTerm.toLowerCase()) ||
            shelter.location.toLowerCase().includes(shelterSearchTerm.toLowerCase()) ||
            shelter.area.toLowerCase().includes(shelterSearchTerm.toLowerCase()) ||
            shelter.contacts.some((c) => c.phone.includes(shelterSearchTerm));
        const matchesArea = selectedArea === "ทั้งหมด" || shelter.area === selectedArea;
        return matchesSearch && matchesArea;
    });

    // Sort shelters
    const sortedShelters = [...filteredShelters].sort((a, b) => {
        if (shelterSortBy === "area") {
            return a.area.localeCompare(b.area, "th") || a.name.localeCompare(b.name, "th");
        } else {
            return a.name.localeCompare(b.name, "th");
        }
    });

    // Pagination
    const itemsPerPage = shelterViewMode === "grid" ? 6 : 10;
    const totalPages = Math.ceil(sortedShelters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedShelters = sortedShelters.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    // Get unique areas
    const areas = ["ทั้งหมด", ...Array.from(new Set(shelters.map((s) => s.area)))];

    // Pagination Controls Component
    const PaginationControls = () => (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
                แสดง {startIndex + 1}-{Math.min(endIndex, sortedShelters.length)} จาก{" "}
                {sortedShelters.length} รายการ
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                >
                    ← ก่อนหน้า
                </button>

                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, current, and adjacent pages
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
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
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === totalPages
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                >
                    ถัดไป →
                </button>
            </div>
        </div>
    );

    return (
        <section id="shelters" className="mt-8 scroll-mt-20">
            <h2 className="text-2xl font-bold text-neutral-800 mb-2 flex items-center">
                🏠 ศูนย์พักพิง (Shelters)
            </h2>
            <p className="text-neutral-600 text-sm mb-6">
                แสดง {shelters.length} ศูนย์พักพิง
            </p>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ค้นหาศูนย์พักพิง, สถานที่, เบอร์โทร..."
                        value={shelterSearchTerm}
                        onChange={(e) => setShelterSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-neutral-900 placeholder-neutral-400 shadow-sm"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                        🔍
                    </span>
                    {shelterSearchTerm && (
                        <button
                            onClick={() => setShelterSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Area Filter + View Mode + Sort */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Area Filters */}
                    <div className="flex flex-wrap gap-2">
                        {areas.map((area) => {
                            const count =
                                area === "ทั้งหมด"
                                    ? shelters.length
                                    : shelters.filter((s) => s.area === area).length;
                            return (
                                <button
                                    key={area}
                                    onClick={() => setSelectedArea(area)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedArea === area
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                                        }`}
                                >
                                    {area} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* View Mode & Sort Controls */}
                    <div className="flex gap-2 items-center">
                        {/* View Mode Toggle */}
                        <div className="flex bg-white rounded-lg border border-neutral-200 p-1">
                            <button
                                onClick={() => setShelterViewMode("grid")}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${shelterViewMode === "grid"
                                        ? "bg-blue-600 text-white"
                                        : "text-neutral-600 hover:text-neutral-900"
                                    }`}
                                title="Grid View"
                            >
                                🗂️ Grid
                            </button>
                            <button
                                onClick={() => setShelterViewMode("list")}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${shelterViewMode === "list"
                                        ? "bg-blue-600 text-white"
                                        : "text-neutral-600 hover:text-neutral-900"
                                    }`}
                                title="List View"
                            >
                                📋 List
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={shelterSortBy}
                            onChange={(e) => setShelterSortBy(e.target.value as "name" | "area")}
                            className="px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="area">เรียงตามพื้นที่</option>
                            <option value="name">เรียงตามชื่อ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* No Results */}
            {sortedShelters.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">ไม่พบข้อมูล</h3>
                    <p className="text-neutral-500 text-center max-w-md">
                        ไม่พบศูนย์พักพิงที่ตรงกับคำค้นหา "{shelterSearchTerm}"
                        {selectedArea !== "ทั้งหมด" && ` ในพื้นที่ "${selectedArea}"`}
                    </p>
                    <button
                        onClick={() => {
                            setShelterSearchTerm("");
                            setSelectedArea("ทั้งหมด");
                            setCurrentPage(1);
                        }}
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        ล้างการค้นหา
                    </button>
                </div>
            )}

            {/* List View */}
            {sortedShelters.length > 0 && shelterViewMode === "list" && (
                <>
                    <div className="space-y-2">
                        {paginatedShelters.map((shelter) => (
                            <div
                                key={shelter.id}
                                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 hover:border-blue-200"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="text-2xl flex-shrink-0">{shelter.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-neutral-900 truncate">
                                                {shelter.name}
                                            </h3>
                                            <p className="text-neutral-600 text-sm truncate">
                                                📍 {shelter.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            {shelter.area}
                                        </span>
                                        {shelter.contacts.length > 0 && (
                                            <a
                                                href={`tel:${shelter.contacts[0].phone}`}
                                                className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                title={`โทร ${shelter.contacts[0].name}`}
                                            >
                                                <span>📞</span>
                                                <span className="hidden sm:inline">โทร</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && <PaginationControls />}
                </>
            )}

            {/* Grid View */}
            {sortedShelters.length > 0 && shelterViewMode === "grid" && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {paginatedShelters.map((shelter) => (
                            <div
                                key={shelter.id}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 flex flex-col h-full"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="text-4xl">{shelter.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-neutral-900 mb-1">
                                            {shelter.name}
                                        </h3>
                                        <p className="text-neutral-600 text-sm mb-1">
                                            📍 {shelter.location}
                                        </p>
                                        <p className="text-green-600 text-sm font-medium mb-1">
                                            ✅ {shelter.status}
                                        </p>
                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            {shelter.area}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-4 flex flex-col flex-1">
                                    {shelter.contacts.length > 0 ? (
                                        <>
                                            <p className="text-neutral-700 font-medium text-sm mb-2">
                                                ผู้ประสานงาน:
                                            </p>
                                            <div className="space-y-2 mb-4">
                                                {shelter.contacts.map((contact, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span className="text-neutral-600 flex-1">
                                                            {contact.name}
                                                        </span>
                                                        <a
                                                            href={`tel:${contact.phone}`}
                                                            className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
                                                        >
                                                            {contact.phone}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-neutral-500 text-sm mb-4">
                                            ไม่มีข้อมูลผู้ประสานงาน
                                        </p>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 mt-auto">
                                        {shelter.contacts.length > 0 && (
                                            <a
                                                href={`tel:${shelter.contacts[0].phone}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                                            >
                                                <span>📞</span>
                                                <span>โทรทันที</span>
                                            </a>
                                        )}
                                        {shelter.link && (
                                            <a
                                                href={shelter.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors text-sm"
                                            >
                                                <span>📍</span>
                                                <span>แผนที่</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && <PaginationControls />}
                </>
            )}
        </section>
    );
}
