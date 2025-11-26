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

export default function Home() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotlines = async () => {
      try {
        const res = await fetch("http://localhost:3001/hotlines");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setHotlines(data);
      } catch (error) {
        console.error("Error fetching hotlines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotlines();
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
      </div>
    </main>
  );
}
