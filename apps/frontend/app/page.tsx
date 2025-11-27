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
}

export default function Home() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ยอดฮิต");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotlinesRes, linksRes, sheltersRes] = await Promise.all([
          fetch("/api/hotlines"),
          fetch("/api/external-links"),
          fetch("/api/shelters"),
        ]);

        if (!hotlinesRes.ok || !linksRes.ok || !sheltersRes.ok)
          throw new Error("Failed to fetch");

        const [hotlinesData, linksData, sheltersData] = await Promise.all([
          hotlinesRes.json(),
          linksRes.json(),
          sheltersRes.json(),
        ]);

        setHotlines(hotlinesData);
        setExternalLinks(linksData);
        setShelters(sheltersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8 font-sans relative overflow-hidden">
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

          <div className="mt-6 flex gap-4">
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
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
            🏠 ศูนย์พักพิง (Shelters)
          </h2>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shelters.map((shelter) => (
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
                      <p className="text-green-600 text-sm font-medium">
                        ✅ {shelter.status}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-4">
                    <p className="text-neutral-700 font-medium text-sm mb-2">
                      ผู้ประสานงาน:
                    </p>
                    <div className="space-y-2">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
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

        <section className="mt-12">
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
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium z-50"
        >
          <span className="text-xl">💬</span>
          <span>แจ้งข้อมูล / ข้อเสนอแนะ</span>
        </a>
      </div >
    </main >
  );
}
