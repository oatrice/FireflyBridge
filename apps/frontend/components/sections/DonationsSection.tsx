"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import type { DonationChannel } from "@/lib/types";
import { getBankInfo } from "@/lib/utils/bankInfo";

interface DonationsSectionProps {
    donations: DonationChannel[];
    loading: boolean;
}

export default function DonationsSection({ donations, loading }: DonationsSectionProps) {
    const [donationSearchTerm, setDonationSearchTerm] = useState("");
    const [donationFilter, setDonationFilter] = useState("ทั้งหมด");
    const [donationSortBy, setDonationSortBy] = useState<"name" | "bank">("name");
    const [showAllDonations, setShowAllDonations] = useState(false);


    const getCategory = (d: DonationChannel) => {
        if (d.name.includes("โรงพยาบาล") || d.name.includes("รพ.")) return "โรงพยาบาล";
        if (d.name.includes("มูลนิธิ") || d.name.includes("สมาคม")) return "มูลนิธิ";
        return "องค์กรหลัก";
    };

    if (loading) {
        return (
            <section id="donations" className="mt-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2 flex items-center">
                    ❤️ ช่องทางรับบริจาค (Donations)
                </h2>
                <p className="text-neutral-600 text-sm mb-6">กำลังโหลด...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className="h-64 bg-white rounded-2xl shadow-sm animate-pulse"
                        ></div>
                    ))}
                </div>
            </section>
        );
    }

    // Filter donations
    const filteredDonations = donations.filter((donation) => {
        const matchesSearch =
            donation.name.toLowerCase().includes(donationSearchTerm.toLowerCase()) ||
            (donation.bankName && donation.bankName.toLowerCase().includes(donationSearchTerm.toLowerCase())) ||
            (donation.accountNumber && donation.accountNumber.includes(donationSearchTerm)) ||
            (donation.description && donation.description.toLowerCase().includes(donationSearchTerm.toLowerCase()));
        const matchesFilter = donationFilter === "ทั้งหมด" || getCategory(donation) === donationFilter;
        return matchesSearch && matchesFilter;
    });

    // Sort donations
    const sortedDonations = [...filteredDonations].sort((a, b) => {
        if (donationSortBy === "bank") {
            const bankA = a.bankName || "zzz";
            const bankB = b.bankName || "zzz";
            return bankA.localeCompare(bankB, "th") || a.name.localeCompare(b.name, "th");
        } else {
            return a.name.localeCompare(b.name, "th");
        }
    });

    const filters = ["ทั้งหมด", "องค์กรหลัก", "โรงพยาบาล", "มูลนิธิ"];

    return (
        <>
            <section id="donations" className="mt-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2 flex items-center">
                    ❤️ ช่องทางรับบริจาค (Donations)
                </h2>
                <p className="text-neutral-600 text-sm mb-6">
                    แสดง {donations.length} ช่องทาง
                </p>

                {/* Search and Filter Controls */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ค้นหาช่องทางบริจาค, ชื่อองค์กร, ธนาคาร..."
                            value={donationSearchTerm}
                            onChange={(e) => setDonationSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-pink-300 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-neutral-900 placeholder-neutral-400 shadow-sm"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                            🔍
                        </span>
                        {donationSearchTerm && (
                            <button
                                onClick={() => setDonationSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter + Sort Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Type Filters */}
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => {
                                const count =
                                    filter === "ทั้งหมด"
                                        ? donations.length
                                        : donations.filter((d) => getCategory(d) === filter).length;
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setDonationFilter(filter)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${donationFilter === filter
                                            ? "bg-pink-600 text-white shadow-md"
                                            : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                                            }`}
                                    >
                                        {filter} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={donationSortBy}
                            onChange={(e) => setDonationSortBy(e.target.value as "name" | "bank")}
                            className="px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                        >
                            <option value="name">เรียงตามชื่อ</option>
                            <option value="bank">เรียงตามธนาคาร</option>
                        </select>
                    </div>
                </div>

                {/* No Results */}
                {sortedDonations.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">ไม่พบข้อมูล</h3>
                        <p className="text-neutral-500 text-center max-w-md">
                            ไม่พบช่องทางบริจาคที่ตรงกับคำค้นหา "{donationSearchTerm}"
                            {donationFilter !== "ทั้งหมด" && ` ในประเภท "${donationFilter}"`}
                        </p>
                        <button
                            onClick={() => {
                                setDonationSearchTerm("");
                                setDonationFilter("ทั้งหมด");
                            }}
                            className="mt-6 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                        >
                            ล้างการค้นหา
                        </button>
                    </div>
                )}

                {/* Donation Cards */}
                {sortedDonations.length > 0 && (
                    <>
                        <div className="mb-4 text-sm text-neutral-600">
                            แสดง {sortedDonations.length} จาก {donations.length} ช่องทาง
                        </div>
                        <div className="columns-1 md:columns-2 gap-6 space-y-6">
                            {(showAllDonations ? sortedDonations : sortedDonations.slice(0, 6)).map((donation, i) => {
                                const bankAccounts = donation.bankAccounts && donation.bankAccounts.length > 0
                                    ? donation.bankAccounts
                                    : (donation.bankName ? [{ bankName: donation.bankName, accountNumber: donation.accountNumber, accountName: donation.accountName }] : []);

                                const isMoney = bankAccounts.length > 0 || !!donation.acceptsMoney;
                                const isItems = !!donation.donationPoints && donation.donationPoints.length > 0;

                                return (
                                    <div
                                        key={donation.id}
                                        className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 flex flex-col break-inside-avoid mb-6 ${i >= 6 ? "animate-fade-in-up" : ""
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-2">
                                                {isMoney && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                                                        💰 บริจาคเงิน
                                                    </span>
                                                )}
                                                {isItems && (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">
                                                        📦 บริจาคสิ่งของ
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                            {donation.name}
                                        </h3>

                                        {donation.description && (
                                            <p className="text-neutral-600 text-sm mb-4">
                                                {donation.description}
                                            </p>
                                        )}

                                        {donation.images && donation.images.length > 0 && (
                                            <div className="mb-4">
                                                <ImageCarousel
                                                    images={donation.images}
                                                    alt={`Gallery for ${donation.name}`}
                                                />
                                            </div>
                                        )}



                                        {bankAccounts.length > 0 ? (
                                            <div className="space-y-3 mb-4">
                                                {bankAccounts.map((account, idx) => {
                                                    const bankInfo = getBankInfo(account.bankName);
                                                    return (
                                                        <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">{bankInfo?.icon || '🏦'}</span>
                                                                <div>
                                                                    <p className="text-xs text-neutral-500 font-medium">ธนาคาร</p>
                                                                    <p className={`font-bold text-sm ${bankInfo?.color?.replace("bg-", "text-") || 'text-neutral-700'}`}>
                                                                        {account.bankName}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                                                                <p className="text-lg font-mono font-bold text-neutral-800 tracking-wide">
                                                                    {account.accountNumber}
                                                                </p>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(account.accountNumber || "");
                                                                        alert("คัดลอกเลขบัญชีแล้ว");
                                                                    }}
                                                                    className="flex items-center gap-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                                                                >
                                                                    <span>📋</span>
                                                                    <span>คัดลอก</span>
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 mt-2 truncate">
                                                                ชื่อบัญชี: {account.accountName}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="bg-neutral-50 p-4 rounded-xl mb-4 border border-neutral-100 text-center py-6 flex-1 flex flex-col justify-center">
                                                <p className="text-neutral-400 text-sm">
                                                    ไม่มีข้อมูลบัญชีธนาคาร
                                                </p>
                                            </div>
                                        )}

                                        {donation.contacts && (
                                            <div className="border-t border-neutral-100 pt-4 mt-auto">
                                                <p className="text-neutral-700 font-medium text-sm mb-2">
                                                    ติดต่อสอบถาม:
                                                </p>
                                                <div className="space-y-2">
                                                    {donation.contacts.map((contact, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <span className="text-neutral-600 flex-1 truncate mr-2">
                                                                {contact.name}
                                                            </span>
                                                            <a
                                                                href={`tel:${contact.phone}`}
                                                                className="text-blue-600 font-medium hover:text-blue-700 hover:underline whitespace-nowrap"
                                                            >
                                                                {contact.phone}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Show More/Less Button */}
                        {filteredDonations.length > 6 && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => {
                                        if (showAllDonations) {
                                            document.getElementById("donations")?.scrollIntoView({ behavior: "smooth" });
                                        }
                                        setShowAllDonations(!showAllDonations);
                                    }}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-full font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <span>{showAllDonations ? "ย่อรายการ" : "ดูทั้งหมด"}</span>
                                    <span
                                        className={`transform transition-transform duration-300 ${showAllDonations ? "rotate-180" : ""
                                            }`}
                                    >
                                        ▼
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* QR Code Modal Removed */}
        </>
    );
}
