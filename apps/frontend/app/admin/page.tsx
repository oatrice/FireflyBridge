"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: session } = await authClient.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            if ((session.user as any).role !== "admin") {
                setUser({ role: "user" }); // Mark as non-admin
            } else {
                setUser(session.user);
            }
            setLoading(false);
        };
        checkSession();
    }, [router]);

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (user?.role !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-red-50 p-6 rounded-2xl mb-4">
                    <span className="text-4xl">🚫</span>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
                <p className="text-neutral-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (You do not have permission)</p>
                <button
                    onClick={handleSignOut}
                    className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                    ออกจากระบบ (Sign Out)
                </button>
            </div>
        );
    }

    const stats = [
        { title: "Hotlines", value: "45", icon: "📞", color: "bg-blue-50 text-blue-600" },
        { title: "Shelters", value: "12", icon: "🏠", color: "bg-green-50 text-green-600" },
        { title: "Donations", value: "8", icon: "💰", color: "bg-purple-50 text-purple-600" },
        { title: "Views Today", value: "1,234", icon: "👁️", color: "bg-orange-50 text-orange-600" },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">ภาพรวม (Overview)</h1>
                    <p className="text-neutral-500">ยินดีต้อนรับ, {user.name}</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                    ออกจากระบบ
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
                        <p className="text-neutral-500 text-sm">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-neutral-900 mb-4">จัดการข้อมูล (Quick Actions)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/hotlines" className="group bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            📞
                        </div>
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-blue-600 transition-colors">Hotlines</h3>
                    </div>
                    <p className="text-neutral-500 text-sm mb-4">จัดการเบอร์โทรฉุกเฉิน เพิ่ม ลบ แก้ไขข้อมูล</p>
                    <span className="text-blue-600 text-sm font-medium group-hover:underline">ไปที่หน้าจัดการ &rarr;</span>
                </Link>

                <Link href="/admin/shelters" className="group bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            🏠
                        </div>
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-green-600 transition-colors">Shelters</h3>
                    </div>
                    <p className="text-neutral-500 text-sm mb-4">จัดการข้อมูลศูนย์พักพิงและจุดอพยพ</p>
                    <span className="text-green-600 text-sm font-medium group-hover:underline">ไปที่หน้าจัดการ &rarr;</span>
                </Link>

                <Link href="/admin/donations" className="group bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            💰
                        </div>
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-purple-600 transition-colors">Donations</h3>
                    </div>
                    <p className="text-neutral-500 text-sm mb-4">จัดการช่องทางการรับบริจาค</p>
                    <span className="text-purple-600 text-sm font-medium group-hover:underline">ไปที่หน้าจัดการ &rarr;</span>
                </Link>

                <Link href="/admin/external-links" className="group bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            🔗
                        </div>
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-orange-600 transition-colors">External Links</h3>
                    </div>
                    <p className="text-neutral-500 text-sm mb-4">จัดการลิงก์ภายนอกและเว็บไซต์ที่เกี่ยวข้อง</p>
                    <span className="text-orange-600 text-sm font-medium group-hover:underline">ไปที่หน้าจัดการ &rarr;</span>
                </Link>
            </div>
        </div>
    );
}
