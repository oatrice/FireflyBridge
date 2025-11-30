"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (provider: "google" | "line") => {
        setLoading(true);
        await authClient.signIn.social({
            provider,
            callbackURL: "/admin",
        });
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage FireflyBridge data
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => handleSignIn("google")}
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Loading..." : "Sign in with Google"}
                    </button>

                    <button
                        onClick={() => handleSignIn("line")}
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B900] hover:bg-[#009900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Loading..." : "Sign in with Line"}
                    </button>
                </div>
            </div>
        </div>
    );
}
