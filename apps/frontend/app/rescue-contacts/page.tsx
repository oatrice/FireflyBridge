"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RescueContact {
    id: string;
    name: string;
    phone: string;
    type: string;
    area: string;
    notes: string;
    createdAt: string;
}

export default function RescueContactsPage() {
    const [contacts, setContacts] = useState<RescueContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        type: "เรือ",
        area: "",
        notes: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/rescue-contacts");
            const data = await res.json();
            setContacts(data);
        } catch (err) {
            console.error("Error fetching contacts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/rescue-contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "เกิดข้อผิดพลาด");
                return;
            }

            setSuccess("เพิ่มเบอร์กู้ภัยสำเร็จ");
            setFormData({ name: "", phone: "", type: "เรือ", area: "", notes: "" });
            fetchContacts();
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ต้องการลบเบอร์กู้ภัยนี้?")) return;

        try {
            await fetch(`/api/rescue-contacts/${id}`, { method: "DELETE" });
            setSuccess("ลบเบอร์กู้ภัยสำเร็จ");
            fetchContacts();
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-700 hover:underline mb-4 inline-block"
                    >
                        ← กลับหน้าหลัก
                    </Link>
                    <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
                        จัดการเบอร์กู้ภัย 🚁
                    </h1>
                    <p className="text-neutral-600">
                        รวบรวมและจัดการเบอร์โทรศัพท์ทีมกู้ภัย พร้อมระบบตรวจสอบเบอร์ซ้ำอัตโนมัติ
                    </p>
                </div>

                {/* Add Contact Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-8">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">
                        เพิ่มเบอร์กู้ภัยใหม่
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
                                    ชื่อหน่วยงาน/บุคคล *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="เช่น มูลนิธิกู้ภัยหาดใหญ่"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    เบอร์โทรศัพท์ *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="เช่น 081-234-5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    ประเภท *
                                </label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, type: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="เรือ">เรือ</option>
                                    <option value="รถ">รถ</option>
                                    <option value="อากาศยาน">อากาศยาน</option>
                                    <option value="ทีมกู้ภัย">ทีมกู้ภัย</option>
                                    <option value="อื่นๆ">อื่นๆ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    พื้นที่ปฏิบัติการ *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.area}
                                    onChange={(e) =>
                                        setFormData({ ...formData, area: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="เช่น หาดใหญ่, สงขลา"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                หมายเหตุ
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="ข้อมูลเพิ่มเติม..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            เพิ่มเบอร์กู้ภัย
                        </button>
                    </form>
                </div>

                {/* Contacts List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">
                        รายการเบอร์กู้ภัย ({contacts.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8 text-neutral-500">
                            กำลังโหลด...
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                            ยังไม่มีเบอร์กู้ภัยในระบบ
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="border border-neutral-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-neutral-900">
                                            {contact.name}
                                        </h3>
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="text-blue-600 hover:underline font-medium block mb-1"
                                    >
                                        📞 {contact.phone}
                                    </a>
                                    <p className="text-sm text-neutral-600 mb-1">
                                        <span className="font-medium">ประเภท:</span> {contact.type}
                                    </p>
                                    <p className="text-sm text-neutral-600 mb-1">
                                        <span className="font-medium">พื้นที่:</span> {contact.area}
                                    </p>
                                    {contact.notes && (
                                        <p className="text-sm text-neutral-500 mt-2">
                                            {contact.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
