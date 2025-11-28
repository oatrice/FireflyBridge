"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Hotline, ExternalLink, Shelter, DonationChannel } from "@/lib/types";

// Dynamic imports for code splitting
const Header = dynamic(() => import("@/components/ui/Header"));
const NavigationBar = dynamic(() => import("@/components/ui/NavigationBar"));
const SheltersSection = dynamic(() => import("@/components/sections/SheltersSection"));
const DonationsSection = dynamic(() => import("@/components/sections/DonationsSection"));
const ExternalLinksSection = dynamic(() => import("@/components/sections/ExternalLinksSection"));
const HotlinesSection = dynamic(() => import("@/components/sections/HotlinesSection"));

export default function Home() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [donations, setDonations] = useState<DonationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

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
        <Header />
        <NavigationBar />
        <SheltersSection shelters={shelters} loading={loading} />
        <DonationsSection donations={donations} loading={loading} />
        <ExternalLinksSection externalLinks={externalLinks} loading={loading} />
        <HotlinesSection hotlines={hotlines} loading={loading} />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-neutral-200">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-neutral-800">ติดต่อทีมพัฒนา</h3>
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
      </div>
    </main>
  );
}
