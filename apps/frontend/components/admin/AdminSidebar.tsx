"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            title: "ภาพรวม (Overview)",
            path: "/admin",
            icon: "📊",
        },
        {
            title: "เบอร์โทรฉุกเฉิน (Hotlines)",
            path: "/admin/hotlines",
            icon: "📞",
        },
        {
            title: "ศูนย์พักพิง (Shelters)",
            path: "/admin/shelters",
            icon: "🏠",
        },
        {
            title: "การบริจาค (Donations)",
            path: "/admin/donations",
            icon: "💰",
        },
    ];

    return (
        <aside className="w-64 bg-white border-r border-neutral-200 min-h-screen fixed left-0 top-0 pt-20 hidden md:block z-40">
            <div className="px-6 mb-8">
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Admin Menu
                </h2>
            </div>

            <nav className="px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-8 left-0 w-full px-6">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
                >
                    <span className="text-xl">⬅️</span>
                    <span>กลับหน้าหลัก</span>
                </Link>
            </div>
        </aside>
    );
}
