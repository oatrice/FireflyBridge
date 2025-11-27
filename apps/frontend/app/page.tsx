"use client";

import { useEffect, useState } from "react";

interface Hotline {
  id: string;
  name: string;
  number?: string;
  numbers?: string[];
  category: string;
  categories?: string[];
  description: string;
  color: string;
  links?: {
    facebook?: string;
    website?: string;
    line?: string;
    instagram?: string[];
    youtube?: string;
  };
}

interface ExternalLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  icon: string;
}

interface Shelter {
  id: string;
  name: string;
  location: string;
  status: string;
  contacts: Array<{ name: string; phone: string }>;
  area: string;
  icon: string;
  link?: string;
}

interface DonationChannel {
  id: string;
  name: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  description?: string;
  qrCodeUrl?: string;
  contacts?: { name: string; phone: string }[];
}

export default function Home() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [donations, setDonations] = useState<DonationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ยอดฮิต");
  const [isScrolled, setIsScrolled] = useState(false);

  // Shelter-specific states
  const [shelterSearchTerm, setShelterSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("ทั้งหมด");
  const [shelterViewMode, setShelterViewMode] = useState<"grid" | "list">("grid");
  const [shelterSortBy, setShelterSortBy] = useState<"name" | "area">("area");
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotlinesRes, linksRes, sheltersRes, donationsRes] = await Promise.all([
          fetch("/api/hotlines"),
          fetch("/api/external-links"),
          fetch("/api/shelters"),
          fetch("/api/donations"),
        ]);

        if (!hotlinesRes.ok || !linksRes.ok || !sheltersRes.ok || !donationsRes.ok)
          throw new Error("Failed to fetch");

        const [hotlinesData, linksData, sheltersData, donationsData] = await Promise.all([
          hotlinesRes.json(),
          linksRes.json(),
          sheltersRes.json(),
          donationsRes.json(),
        ]);

        setHotlines(hotlinesData);
        setExternalLinks(linksData);
        setShelters(sheltersData);
        setDonations(donationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8 font-sans relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="flex flex-col items-center">
            <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span className="text-5xl">🛟</span>
                Firefly Bridge
              </h1>
            </div>
            <p className="text-neutral-700 text-lg font-medium mt-4 bg-white/60 backdrop-blur-sm inline-block px-6 py-2 rounded-full shadow-sm">
              ศูนย์รวมข้อมูลและประสานงานภัยพิบัติ
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdauJYHcAqhIEgsWqEtAXo_5VptI-xt4L3VVASfvuLlohHxZA/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="text-2xl">🏃</span>
              <div className="text-left">
                <div className="font-bold text-lg leading-tight">
                  แบบฟอร์มอพยพ
                </div>
                <div className="text-xs text-orange-100 font-medium">
                  ศูนย์ประสานงานอพยพ ม.อ.
                </div>
              </div>
            </a>

            <a
              href="https://forms.gle/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="text-2xl">✅</span>
              <div className="text-left">
                <div className="font-bold text-lg leading-tight">
                  รายงานผู้ที่ปลอดภัยแล้ว
                </div>
                <div className="text-xs text-teal-100 font-medium">
                  (เฉพาะผู้ที่ได้รับการอพยพแล้ว)
                </div>
              </div>
            </a>

            <a
              href="https://www.thaihelpcenter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="text-2xl">📋</span>
              <div className="text-left">
                <div className="font-bold text-lg leading-tight">
                  ตรวจสอบรายชื่อ
                </div>
                <div className="text-xs text-blue-100 font-medium">
                  ผู้ที่ได้รับการช่วยเหลือไปยังศูนย์พักพิง
                </div>
              </div>
            </a>
          </div>
        </header>

        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl backdrop-blur-sm border-b border-white/10 rounded-b-2xl">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 lg:gap-4 py-4 overflow-x-auto scrollbar-hide">
              <a
                href="#shelters"
                className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                <span className="relative text-lg sm:text-xl">🏠</span>
                <span className="relative">ศูนย์พักพิง</span>
              </a>
              <a
                href="#donations"
                className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                <span className="relative text-lg sm:text-xl">❤️</span>
                <span className="relative">รับบริจาค</span>
              </a>
              <a
                href="#external"
                className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                <span className="relative text-lg sm:text-xl">🔗</span>
                <span className="relative">แพลตฟอร์ม</span>
              </a>
              <a
                href="#hotlines"
                className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                <span className="relative text-lg sm:text-xl">📞</span>
                <span className="relative">เบอร์ฉุกเฉิน</span>
              </a>
            </div>
          </div>
        </nav>

        <section id="shelters" className="mt-8 scroll-mt-20">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2 flex items-center">
            🏠 ศูนย์พักพิง (Shelters)
          </h2>
          <p className="text-neutral-600 text-sm mb-6">
            แสดง {shelters.length} ศูนย์พักพิง
          </p>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-white rounded-2xl shadow-sm animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
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
                    {(() => {
                      const areas = ["ทั้งหมด", ...Array.from(new Set(shelters.map(s => s.area)))];
                      return areas.map((area) => {
                        const count = area === "ทั้งหมด"
                          ? shelters.length
                          : shelters.filter(s => s.area === area).length;
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
                      });
                    })()}
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

              {(() => {
                // Filter shelters
                const filteredShelters = shelters.filter((shelter) => {
                  const matchesSearch =
                    shelter.name.toLowerCase().includes(shelterSearchTerm.toLowerCase()) ||
                    shelter.location.toLowerCase().includes(shelterSearchTerm.toLowerCase()) ||
                    shelter.area.toLowerCase().includes(shelterSearchTerm.toLowerCase()) ||
                    shelter.contacts.some(c => c.phone.includes(shelterSearchTerm));
                  const matchesArea = selectedArea === "ทั้งหมด" || shelter.area === selectedArea;
                  return matchesSearch && matchesArea;
                });

                // Sort shelters
                const sortedShelters = [...filteredShelters].sort((a, b) => {
                  if (shelterSortBy === "area") {
                    return a.area.localeCompare(b.area, 'th') || a.name.localeCompare(b.name, 'th');
                  } else {
                    return a.name.localeCompare(b.name, 'th');
                  }
                });

                if (sortedShelters.length === 0) {
                  return (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">
                        ไม่พบข้อมูล
                      </h3>
                      <p className="text-neutral-500 text-center max-w-md">
                        ไม่พบศูนย์พักพิงที่ตรงกับคำค้นหา "{shelterSearchTerm}"
                        {selectedArea !== "ทั้งหมด" && ` ในพื้นที่ "${selectedArea}"`}
                      </p>
                      <button
                        onClick={() => {
                          setShelterSearchTerm("");
                          setSelectedArea("ทั้งหมด");
                        }}
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ล้างการค้นหา
                      </button>
                    </div>
                  );
                }

                // Render based on view mode
                if (shelterViewMode === "list") {
                  // List View - Compact
                  return (
                    <div className="space-y-2">
                      {sortedShelters.map((shelter) => (
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
                  );
                } else {
                  // Grid View - Detailed
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {sortedShelters.map((shelter) => (
                        <div
                          key={shelter.id}
                          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100"
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

                          <div className="border-t border-neutral-100 pt-4">
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
                            <div className="flex gap-2">
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
                  );
                }
              })()}
            </>
          )}
        </section>

        <section id="donations" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
            ❤️ ช่องทางรับบริจาค (Donations)
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white rounded-2xl shadow-sm animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100"
                >
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {donation.name}
                  </h3>
                  {donation.description && (
                    <p className="text-neutral-600 text-sm mb-4">
                      {donation.description}
                    </p>
                  )}

                  {donation.qrCodeUrl && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={donation.qrCodeUrl}
                        alt={`QR Code for ${donation.name}`}
                        className="max-w-[200px] rounded-lg border border-neutral-200"
                      />
                    </div>
                  )}

                  {donation.bankName && (
                    <div className="bg-neutral-50 p-4 rounded-xl mb-4">
                      <p className="text-sm text-neutral-500 mb-1">ธนาคาร</p>
                      <p className="font-bold text-neutral-800">{donation.bankName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xl font-mono font-bold text-blue-600">
                          {donation.accountNumber}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(donation.accountNumber || "");
                            alert("คัดลอกเลขบัญชีแล้ว");
                          }}
                          className="flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                          <span>📋</span>
                          <span>คัดลอก</span>
                        </button>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        ชื่อบัญชี: {donation.accountName}
                      </p>
                    </div>
                  )}

                  {donation.contacts && (
                    <div className="border-t border-neutral-100 pt-4">
                      <p className="text-neutral-700 font-medium text-sm mb-2">
                        ติดต่อสอบถาม:
                      </p>
                      <div className="space-y-2">
                        {donation.contacts.map((contact, idx) => (
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="external" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
            🔗 แพลตฟอร์มภายนอก (External Rescue Platforms)
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {externalLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 hover:border-blue-200 hover:bg-blue-50/30"
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
          )}
        </section>

        <section id="hotlines" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
            📞 เบอร์โทรฉุกเฉิน (Emergency Hotlines)
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-white rounded-2xl shadow-sm animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
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
                  {(() => {
                    // Extract all categories including from categories array
                    const allCategoriesSet = new Set<string>();
                    hotlines.forEach((h: any) => {
                      allCategoriesSet.add(h.category);
                      if (h.categories) {
                        h.categories.forEach((cat: string) => allCategoriesSet.add(cat));
                      }
                    });
                    const allCategories = Array.from(allCategoriesSet);
                    const priorityCategories = ["ทั้งหมด", "ยอดฮิต", "มูลนิธิ", "อาสาสมัคร", "ท้องถิ่น"];
                    const otherCategories = allCategories.filter(cat => !priorityCategories.includes(cat));
                    const orderedCategories = [...priorityCategories, ...otherCategories];

                    return orderedCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category === "ทั้งหมด" ? "All" : category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${(category === "ทั้งหมด" && selectedCategory === "All") || selectedCategory === category
                          ? "bg-blue-600 text-white"
                          : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                          }`}
                      >
                        {category}
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {(() => {
                const filteredHotlines = hotlines.filter((hotline: any) => {
                  const matchesSearch =
                    hotline.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    (hotline.number && hotline.number.includes(searchTerm)) ||
                    (hotline.numbers && hotline.numbers.some((n: string) => n.includes(searchTerm))) ||
                    hotline.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  const matchesCategory =
                    selectedCategory === "All" ||
                    hotline.category === selectedCategory ||
                    (hotline.categories && hotline.categories.includes(selectedCategory));
                  return matchesSearch && matchesCategory;
                });

                if (filteredHotlines.length === 0) {
                  return (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">
                        ไม่พบข้อมูล
                      </h3>
                      <p className="text-neutral-500 text-center max-w-md">
                        ไม่พบเบอร์โทรที่ตรงกับคำค้นหา "{searchTerm}"
                        {selectedCategory !== "All" && ` ในหมวด "${selectedCategory}"`}
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("All");
                        }}
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ล้างการค้นหา
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHotlines.map((hotline) => (
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

                        <p className="text-neutral-800 font-medium mb-2">
                          {hotline.name}
                        </p>
                        <p className="text-neutral-500 text-sm mb-3">
                          {hotline.description}
                        </p>

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
                            {hotline.links.instagram && hotline.links.instagram.map((igLink, idx) => (
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
                                href={hotline.links.youtube.startsWith('http') ? hotline.links.youtube : `https://${hotline.links.youtube}`}
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
                );
              })()}
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-neutral-200">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-neutral-800">
              ติดต่อทีมพัฒนา
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="https://forms.gle/Wov1KL5bVdajnvkM7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>📝</span>
                <span>แบบฟอร์มข้อเสนอแนะ</span>
              </a>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <a
                href="https://www.facebook.com/FireflyBridge/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>👥</span>
                <span>Facebook Page</span>
              </a>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <a
                href="https://github.com/oatrice/FireflyBridge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>💻</span>
                <span>GitHub (Contribute)</span>
              </a>
            </div>
            <p className="text-neutral-500 text-xs mt-4">
              © 2025 Firefly Bridge - Joint Command Center
            </p>
          </div>
        </footer>

        {/* Floating Feedback Button */}
        <a
          href="https://forms.gle/Wov1KL5bVdajnvkM7"
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium z-50 overflow-hidden group ${isScrolled ? "px-3 py-3 w-12 hover:w-auto hover:px-6" : "px-6 py-3"
            }`}
        >
          <span className="text-xl shrink-0">💬</span>
          <span
            className={`whitespace-nowrap transition-all duration-300 ${isScrolled
              ? "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100"
              : "w-auto opacity-100"
              }`}
          >
            แจ้งข้อมูล / ข้อเสนอแนะ
          </span>
        </a>
      </div >
    </main >
  );
}
