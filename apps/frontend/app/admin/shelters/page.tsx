"use client";

import { useState, useEffect } from "react";
import { AdminModal } from "@/components/ui/AdminModal";
import type { Shelter } from "@/lib/types";

export default function SheltersAdminPage() {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
    const [formData, setFormData] = useState<Partial<Shelter>>({
        name: "",
        location: "",
        status: "open",
        contacts: [{ name: "", phone: "" }],
        area: "",
        icon: "🏠",
        link: "",
    });

    // Fetch shelters
    const fetchShelters = async () => {
        try {
            const res = await fetch("/api/shelters");
            if (res.ok) {
                const data = await res.json();
                setShelters(data);
            }
        } catch (error) {
            console.error("Failed to fetch shelters:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShelters();
    }, []);

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clean up contacts
        const cleanedContacts = formData.contacts?.filter(c => c.name.trim() !== "" || c.phone.trim() !== "") || [];
        const payload = { ...formData, contacts: cleanedContacts };

        try {
            const url = editingShelter
                ? `/api/shelters/${editingShelter.id}`
                : "/api/shelters";

            const method = editingShelter ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingShelter(null);
                setFormData({
                    name: "",
                    location: "",
                    status: "open",
                    contacts: [{ name: "", phone: "" }],
                    area: "",
                    icon: "🏠",
                    link: "",
                });
                fetchShelters();
            } else {
                alert("Failed to save shelter");
            }
        } catch (error) {
            console.error("Error saving shelter:", error);
            alert("Error saving shelter");
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this shelter?")) return;

        try {
            const res = await fetch(`/api/shelters/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchShelters();
            } else {
                alert("Failed to delete shelter");
            }
        } catch (error) {
            console.error("Error deleting shelter:", error);
        }
    };

    // Open modal for editing
    const handleEdit = (shelter: Shelter) => {
        setEditingShelter(shelter);
        setFormData({
            ...shelter,
            contacts: shelter.contacts && shelter.contacts.length > 0 ? shelter.contacts : [{ name: "", phone: "" }],
        });
        setIsModalOpen(true);
    };

    // Open modal for creating
    const handleCreate = () => {
        setEditingShelter(null);
        setFormData({
            name: "",
            location: "",
            status: "open",
            contacts: [{ name: "", phone: "" }],
            area: "",
            icon: "🏠",
            link: "",
        });
        setIsModalOpen(true);
    };

    // Helper to update contacts
    const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
        const newContacts = [...(formData.contacts || [])];
        if (!newContacts[index]) newContacts[index] = { name: "", phone: "" };
        newContacts[index] = { ...newContacts[index], [field]: value };
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContactField = () => {
        setFormData({ ...formData, contacts: [...(formData.contacts || []), { name: "", phone: "" }] });
    };

    const removeContactField = (index: number) => {
        const newContacts = [...(formData.contacts || [])];
        newContacts.splice(index, 1);
        setFormData({ ...formData, contacts: newContacts });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">เปิดรับ</span>;
            case 'full': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">เต็ม</span>;
            case 'closed': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">ปิด</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">จัดการศูนย์พักพิง (Shelters)</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <span>➕</span> เพิ่มข้อมูล
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-neutral-700">ชื่อศูนย์พักพิง</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">พื้นที่</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">สถานะ</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">ผู้ติดต่อ</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {shelters.map((shelter) => (
                                <tr key={shelter.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900 flex items-center gap-2">
                                            <span>{shelter.icon || "🏠"}</span>
                                            {shelter.name}
                                        </div>
                                        {shelter.location && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs mt-1">📍 {shelter.location}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600">
                                        {shelter.area || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(shelter.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm">
                                            {shelter.contacts?.map((contact, idx) => (
                                                <div key={idx} className="text-neutral-600">
                                                    <span className="font-medium">{contact.name}:</span> {contact.phone}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(shelter)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(shelter.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {shelters.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingShelter ? "แก้ไขข้อมูลศูนย์พักพิง" : "เพิ่มศูนย์พักพิงใหม่"}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">ชื่อศูนย์พักพิง</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="เช่น วัด..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">พื้นที่ (อำเภอ/ตำบล)</label>
                            <input
                                type="text"
                                value={formData.area || ""}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="เช่น อ.หาดใหญ่"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ที่ตั้ง (Google Maps Link หรือที่อยู่)</label>
                        <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="https://maps.google.com/..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">สถานะ</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            >
                                <option value="open">🟢 เปิดรับ (Open)</option>
                                <option value="full">🟡 เต็ม (Full)</option>
                                <option value="closed">🔴 ปิด (Closed)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">ไอคอน (Emoji)</label>
                            <input
                                type="text"
                                value={formData.icon || "🏠"}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="🏠"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ผู้ติดต่อ</label>
                        <div className="space-y-2">
                            {formData.contacts?.map((contact, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="ชื่อผู้ติดต่อ"
                                    />
                                    <input
                                        type="text"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="เบอร์โทร"
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeContactField(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addContactField}
                                className="text-sm text-green-600 hover:underline flex items-center gap-1"
                            >
                                <span>➕</span> เพิ่มผู้ติดต่อ
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ลิงก์เพิ่มเติม (ถ้ามี)</label>
                        <input
                            type="text"
                            value={formData.link || ""}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
