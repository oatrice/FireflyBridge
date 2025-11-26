"use client";

import { useEffect, useState } from "react";

interface Hotline {
  id: string;
  name: string;
  number: string;
  category: string;
  description: string;
  color: string;
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
    <main className="min-h-screen bg-neutral-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">
            Firefly Bridge 🛟
          </h1>
          <p className="text-neutral-500 text-lg">
            ศูนย์รวมข้อมูลและประสานงานภัยพิบัติ (Joint Command Center)
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            System Online
          </div>
        </header>

        <section>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotlines.map((hotline) => (
                <div
                  key={hotline.id}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 hover:border-neutral-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${hotline.color}`}
                    >
                      {hotline.category}
                    </span>
                    <a
                      href={`tel:${hotline.number}`}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      aria-label={`Call ${hotline.name}`}
                    >
                      📞
                    </a>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">
                    {hotline.number}
                  </h3>
                  <p className="text-neutral-800 font-medium mb-2">
                    {hotline.name}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    {hotline.description}
                  </p>
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
                href="https://www.facebook.com/profile.php?id=61584449812966"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>👥</span>
                <span>Facebook Page</span>
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
      </div>
    </main>
  );
}
