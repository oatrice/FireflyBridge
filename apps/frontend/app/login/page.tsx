"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    // Feature flag: ปิดหน้า login ในช่วงที่ยังไม่พร้อม launch
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        🚧 Coming Soon
                    </h2>
                    <p className="text-gray-600">
                        Authentication system is currently under development.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [step, setStep] = useState<"initial" | "otp">("initial");

    const [method, setMethod] = useState<"email" | "phone">("phone");
    const [formData, setFormData] = useState({
        email: "",
        phoneNumber: "",
        password: "",
        name: "",
        otp: ""
    });

    const handleSignIn = async (provider: "google" | "line") => {
        setLoading(true);
        await authClient.signIn.social({
            provider,
            callbackURL: "/admin",
        });
        setLoading(false);
    };

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === "email") {
            await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
                callbackURL: "/admin",
            }, {
                onSuccess: () => router.push("/admin"),
                onError: (ctx: any) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        } else {
            await authClient.signIn.phoneNumber({
                phoneNumber: formData.phoneNumber,
                password: formData.password,
            }, {
                onSuccess: () => router.push("/admin"),
                onError: (ctx: any) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === "email") {
            await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.name,
            }, {
                onSuccess: async () => {
                    await authClient.emailOtp.sendVerificationOtp({
                        email: formData.email,
                        type: "email-verification"
                    });
                    setStep("otp");
                    setLoading(false);
                },
                onError: (ctx: any) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        } else {
            // Try to send OTP directly first. 
            // If the user doesn't exist, this might just send OTP for verification.
            // After verification, we might need to "sign up" or "sign in".
            // But usually phone number auth is "passwordless" or "OTP based".
            // If we want password + phone, it's different.
            // The current UI asks for password.
            // If we want Phone + Password, we might need to use `signUp.email` but with phone? No.
            // Let's assume we want Phone + OTP (no password) or Phone + Password.
            // The `phoneNumber` plugin in better-auth is usually for OTP based auth.
            // If we want Phone + Password, we might need to add `phoneNumber` to `user` schema and use `emailAndPassword` but allow phone?
            // But `better-auth` `emailAndPassword` is strictly email.
            // So `phoneNumber` plugin is likely OTP only or Phone + Password if configured.
            // Let's try to use `sendOtp` to see if the route exists.

            await authClient.phoneNumber.sendOtp({
                phoneNumber: formData.phoneNumber,
            }, {
                onSuccess: async () => {
                    setStep("otp");
                    setLoading(false);
                },
                onError: (ctx: any) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === "email") {
            await authClient.emailOtp.verifyEmail({
                email: formData.email,
                otp: formData.otp,
            }, {
                onSuccess: () => {
                    alert("Email verified successfully! You can now login.");
                    setIsRegister(false);
                    setStep("initial");
                    setLoading(false);
                },
                onError: (ctx: any) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        } else {
            // Verify OTP (Better Auth will auto-create user if signUpOnVerification is enabled)
            await authClient.phoneNumber.verify({
                phoneNumber: formData.phoneNumber,
                code: formData.otp,
            }, {
                onSuccess: () => {
                    alert("Phone number verified successfully!");
                    router.push("/admin");
                },
                onError: (ctx: any) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {step === "otp" ? "Verify OTP" : (isRegister ? "Create Account" : "Admin Login")}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === "otp"
                            ? `Please enter the OTP sent to your ${method}`
                            : (isRegister ? "Sign up to get started" : "Sign in to manage FireflyBridge data")}
                    </p>
                </div>

                {step === "initial" && (
                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            onClick={() => setMethod("phone")}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${method === "phone"
                                ? "bg-red-100 text-red-700"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Phone
                        </button>
                        <button
                            onClick={() => setMethod("email")}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${method === "email"
                                ? "bg-red-100 text-red-700"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Email
                        </button>
                    </div>
                )}

                {step === "otp" ? (
                    <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="otp" className="sr-only">OTP</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder="Enter OTP"
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                ) : (
                    <div className="mt-8 space-y-6">
                        <form onSubmit={isRegister ? handleRegister : handleCredentialsSignIn} className="space-y-4">
                            {isRegister && method === "email" && (
                                <div>
                                    <label htmlFor="name" className="sr-only">Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}

                            {method === "email" ? (
                                <div>
                                    <label htmlFor="email-address" className="sr-only">Email address</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                                    <input
                                        id="phone-number"
                                        name="phoneNumber"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                        placeholder="Phone Number (e.g. +66...)"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                            )}

                            {method === "email" && (
                                <div>
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete={isRegister ? "new-password" : "current-password"}
                                        required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? "Loading..." : (isRegister ? (method === "phone" ? "Send OTP" : "Sign Up") : "Sign In")}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSignIn("google")}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                Google
                            </button>
                            <button
                                onClick={() => handleSignIn("line")}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B900] hover:bg-[#009900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                LINE
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-sm text-red-600 hover:text-red-500"
                            >
                                {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
