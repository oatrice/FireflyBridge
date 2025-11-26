"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Case {
    id: number;
    source: string;
    source_url?: string;
    raw_content: string;
    extracted_phones: string[];
    extracted_location?: string;
    latitude?: number;
    longitude?: number;
    description: string;
    urgency_level: string;
    status: string;
    assigned_to?: string;
    notes?: string;
    created_at: string;
}

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        source: "facebook",
        source_url: "",
        raw_content: "",
        latitude: "",
        longitude: "",
    });
    const [extractedData, setExtractedData] = useState<any>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterUrgency, setFilterUrgency] = useState("");

    useEffect(() => {
        fetchCases();
    }, [filterStatus, filterUrgency]);

    const fetchCases = async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append("status", filterStatus);
            if (filterUrgency) params.append("urgency", filterUrgency);

            const res = await fetch(`/api/cases?${params.toString()}`);
            const data = await res.json();
            setCases(data);
        } catch (err) {
            console.error("Error fetching cases:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const payload = {
                source: formData.source,
                source_url: formData.source_url || undefined,
                raw_content: formData.raw_content,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
            };

            const res = await fetch("/api/cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "เกิดข้อผิดพลาด");
                return;
            }

            const newCase = await res.json();
            setExtractedData(newCase);
            setSuccess("เพิ่มเคสสำเร็จ");
            setFormData({ source: "facebook", source_url: "", raw_content: "", latitude: "", longitude: "" });
            fetchCases();
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await fetch(`/api/cases/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            fetchCases();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const deleteCase = async (id: number) => {
        if (!confirm("ต้องการลบเคสนี้?")) return;

        try {
            await fetch(`/api/cases/${id}`, { method: "DELETE" });
            setSuccess("ลบเคสสำเร็จ");
            fetchCases();
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case "critical": return "bg-red-600 text-white";
            case "high": return "bg-orange-500 text-white";
            case "medium": return "bg-yellow-500 text-white";
            default: return "bg-gray-400 text-white";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-500 text-white";
            case "in_progress": return "bg-blue-500 text-white";
            case "assigned": return "bg-purple-500 text-white";
            default: return "bg-gray-500 text-white";
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-700 hover:underline mb-4 inline-block"
                    >
                        ← กลับหน้าหลัก
                    </Link>
                    <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
                        นำเข้าเคสจาก Social Media 📱
                    </h1>
                    <p className="text-neutral-600">
                        วางข้อความจาก Facebook, Twitter, LINE ระบบจะดึงข้อมูลสำคัญอัตโนมัติ
                    </p>
                </div>

                {/* Import Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-8">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">
                        นำเข้าเคสใหม่
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    แหล่งที่มา *
                                </label>
                                <select
                                    required
                                    value={formData.source}
                                    onChange={(e) =>
                                        setFormData({ ...formData, source: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-900"
                                >
                                    <option value="facebook">Facebook</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="line">LINE</option>
                                    <option value="manual">ป้อนเอง</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    URL ของโพสต์/Comment (ถ้ามี)
                                </label>
                                <input
                                    type="url"
                                    value={formData.source_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, source_url: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-900"
                                    placeholder="https://facebook.com/..."
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    💡 ถ้าหา URL ไม่ได้ ไม่ต้องใส่ก็ได้ - สำคัญที่สุดคือข้อความเนื้อหา
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                ข้อความจาก Social Media *
                            </label>
                            <textarea
                                required
                                value={formData.raw_content}
                                onChange={(e) =>
                                    setFormData({ ...formData, raw_content: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-900"
                                rows={6}
                                placeholder="วางข้อความที่คัดลอกมาจาก Facebook, Twitter, LINE..."
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                ระบบจะดึงเบอร์โทร, สถานที่, ระดับความเร่งด่วน อัตโนมัติ
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Latitude (ถ้ามี)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={(e) =>
                                        setFormData({ ...formData, latitude: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-900"
                                    placeholder="7.0067"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Longitude (ถ้ามี)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={(e) =>
                                        setFormData({ ...formData, longitude: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-900"
                                    placeholder="100.4925"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            นำเข้าเคส
                        </button>
                    </form>

                    {/* Extracted Data Preview */}
                    {extractedData && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-bold text-blue-900 mb-2">ข้อมูลที่ดึงได้:</h3>
                            <div className="space-y-1 text-sm text-neutral-900">
                                <p><strong>เบอร์โทร:</strong> {extractedData.extracted_phones?.join(", ") || "-"}</p>
                                <p><strong>สถานที่:</strong> {extractedData.extracted_location || "-"}</p>
                                <p><strong>รายละเอียด:</strong> {extractedData.description}</p>
                                <p><strong>ความเร่งด่วน:</strong> <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(extractedData.urgency_level)}`}>{extractedData.urgency_level}</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 mb-6">
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                สถานะ
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                            >
                                <option value="">ทั้งหมด</option>
                                <option value="pending">รอดำเนินการ</option>
                                <option value="assigned">มอบหมายแล้ว</option>
                                <option value="in_progress">กำลังดำเนินการ</option>
                                <option value="completed">เสร็จสิ้น</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                ความเร่งด่วน
                            </label>
                            <select
                                value={filterUrgency}
                                onChange={(e) => setFilterUrgency(e.target.value)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                            >
                                <option value="">ทั้งหมด</option>
                                <option value="critical">วิกฤต</option>
                                <option value="high">สูง</option>
                                <option value="medium">ปานกลาง</option>
                                <option value="low">ต่ำ</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cases List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">
                        รายการเคส ({cases.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8 text-neutral-500">
                            กำลังโหลด...
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                            ยังไม่มีเคสในระบบ
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cases.map((c) => (
                                <div
                                    key={c.id}
                                    className="border border-neutral-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(c.urgency_level)}`}>
                                                {c.urgency_level}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                            <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
                                                {c.source}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteCase(c.id)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            ลบ
                                        </button>
                                    </div>

                                    <p className="text-neutral-800 mb-2">
                                        <strong>รายละเอียด:</strong> {c.description}
                                    </p>

                                    {c.extracted_phones && c.extracted_phones.length > 0 && (
                                        <p className="text-sm text-neutral-900 mb-1">
                                            <strong>เบอร์โทร:</strong> {c.extracted_phones.join(", ")}
                                        </p>
                                    )}

                                    {c.extracted_location && (
                                        <p className="text-sm text-neutral-900 mb-1">
                                            <strong>สถานที่:</strong> {c.extracted_location}
                                        </p>
                                    )}

                                    {(c.latitude && c.longitude) && (
                                        <p className="text-sm text-neutral-900 mb-1">
                                            <strong>พิกัด:</strong> {c.latitude}, {c.longitude}
                                        </p>
                                    )}

                                    <div className="mt-3 flex gap-2">
                                        {c.status === "pending" && (
                                            <button
                                                onClick={() => updateStatus(c.id, "assigned")}
                                                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded"
                                            >
                                                มอบหมาย
                                            </button>
                                        )}
                                        {c.status === "assigned" && (
                                            <button
                                                onClick={() => updateStatus(c.id, "in_progress")}
                                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                                            >
                                                เริ่มดำเนินการ
                                            </button>
                                        )}
                                        {c.status === "in_progress" && (
                                            <button
                                                onClick={() => updateStatus(c.id, "completed")}
                                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
                                            >
                                                เสร็จสิ้น
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-xs text-neutral-400 mt-2">
                                        สร้างเมื่อ: {new Date(c.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
