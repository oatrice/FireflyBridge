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
            console.log("Admin Page Session:", session); // Debugging
            if (!session) {
                router.push("/login");
                return;
            }

            if ((session.user as any).role !== "admin") {
                console.log("Role mismatch:", (session.user as any).role); // Debugging
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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (user?.role !== "admin") {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-700">Access Denied</h1>
                <p className="mb-4 text-gray-900">You do not have permission to view this page.</p>
                <button
                    onClick={handleSignOut}
                    className="text-blue-700 hover:underline"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                    <p className="text-gray-900 dark:text-gray-200">Welcome, {user.name} ({user.email})</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Hotlines</h3>
                    <p className="text-gray-900 dark:text-gray-100 mb-4">Manage emergency numbers</p>
                    <Link href="/admin/hotlines" className="text-blue-700 hover:underline">Manage &rarr;</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Shelters</h3>
                    <p className="text-gray-900 dark:text-gray-100 mb-4">Manage shelter locations</p>
                    <Link href="/admin/shelters" className="text-blue-700 hover:underline">Manage &rarr;</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Donations</h3>
                    <p className="text-gray-900 dark:text-gray-100 mb-4">Manage donation channels</p>
                    <Link href="/admin/donations" className="text-blue-600 hover:underline">Manage &rarr;</Link>
                </div>
            </div>
        </div>
    );
}
