"use client";

import { AdminModal } from "@/components/ui/AdminModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import type { ExternalLink } from "@/lib/types";

export default function ExternalLinksAdminPage() {
    const initialFormData: Partial<ExternalLink> = {
        name: "",
        url: "",
        description: "",
        category: "ทั่วไป",
        icon: "🔗",
    };

    const {
        items: links,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingItem: editingLink,
        formData,
        setFormData,
        handleSubmit,
        handleDelete,
        handleEdit,
        handleCreate
    } = useAdminCrud<ExternalLink>(
        "/api/external-links",
        initialFormData
    );

    if (loading) return <LoadingSpinner color="border-orange-600" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">จัดการลิงก์ภายนอก (External Links)</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                    <span>➕</span> เพิ่มข้อมูล
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-neutral-700">ชื่อเว็บไซต์</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">URL</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">หมวดหมู่</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {links.map((link) => (
                                <tr key={link.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{link.icon}</span>
                                            <div>
                                                <div className="font-medium text-neutral-900">{link.name}</div>
                                                {link.description && (
                                                    <div className="text-sm text-neutral-500 truncate max-w-xs">{link.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline truncate max-w-xs block"
                                        >
                                            {link.url}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
                                            {link.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(link)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(link.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {links.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
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
                title={editingLink ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลใหม่"}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">ชื่อเว็บไซต์/แพลตฟอร์ม</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-neutral-900 placeholder-neutral-500"
                            placeholder="เช่น HatYaiFlood.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-neutral-700 mb-1">URL</label>
                        <input
                            id="url"
                            type="url"
                            name="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-neutral-900 placeholder-neutral-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">หมวดหมู่</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-neutral-900"
                        >
                            <option value="ทั่วไป">ทั่วไป</option>
                            <option value="น้ำท่วม">น้ำท่วม</option>
                            <option value="จราจร">จราจร</option>
                            <option value="กล้อง CCTV">กล้อง CCTV</option>
                            <option value="หน่วยงานรัฐ">หน่วยงานรัฐ</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">รายละเอียด</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 text-neutral-900 placeholder-neutral-500"
                            placeholder="รายละเอียดเกี่ยวกับเว็บไซต์..."
                        />
                    </div>

                    <div>
                        <label htmlFor="icon" className="block text-sm font-medium text-neutral-700 mb-1">ไอคอน (Emoji)</label>
                        <input
                            id="icon"
                            type="text"
                            name="icon"
                            value={formData.icon || ""}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-neutral-900 placeholder-neutral-500"
                            placeholder="🔗"
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
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
