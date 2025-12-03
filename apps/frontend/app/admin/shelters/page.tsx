"use client";

import { AdminModal } from "@/components/ui/AdminModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import type { Shelter } from "@/lib/types";
import { AdminInput } from "@/components/ui/AdminInput";
import { AdminSelect } from "@/components/ui/AdminSelect";

interface ShelterForm {
    name: string;
    location: string;
    status: string;
    contacts: { id: string; name: string; phone: string }[];
    area: string;
    icon: string;
    link: string;
}

const generateId = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
};

export default function SheltersAdminPage() {
    const initialFormData: ShelterForm = {
        name: "",
        location: "",
        status: "open",
        contacts: [{ id: generateId(), name: "", phone: "" }],
        area: "",
        icon: "🏠",
        link: "",
    };

    const transformPayload = (data: ShelterForm) => {
        const cleanedContacts = data.contacts
            ?.filter(c => c.name.trim() !== "" || c.phone.trim() !== "")
            .map(({ name, phone }) => ({ name, phone })) || [];
        return { ...data, contacts: cleanedContacts };
    };

    const transformEditData = (shelter: Shelter): ShelterForm => ({
        ...shelter,
        area: shelter.area || "",
        icon: shelter.icon || "🏠",
        link: shelter.link || "",
        contacts: shelter.contacts && shelter.contacts.length > 0
            ? shelter.contacts.map(c => ({ ...c, id: generateId() }))
            : [{ id: generateId(), name: "", phone: "" }],
    });

    const {
        items: shelters,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingItem: editingShelter,
        formData,
        setFormData,
        handleSubmit,
        handleDelete,
        handleEdit,
        handleCreate
    } = useAdminCrud<Shelter, ShelterForm>(
        "/api/shelters",
        initialFormData,
        transformPayload,
        transformEditData
    );

    // Helper to update contacts
    const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
        const newContacts = [...formData.contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContactField = () => {
        setFormData({ ...formData, contacts: [...formData.contacts, { id: generateId(), name: "", phone: "" }] });
    };

    const removeContactField = (index: number) => {
        const newContacts = [...formData.contacts];
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

    if (loading) return <LoadingSpinner color="border-green-600" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">จัดการศูนย์พักพิง (Shelters)</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2"
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
                                                <div key={`${contact.name}-${idx}`} className="text-neutral-600">
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
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">ชื่อศูนย์พักพิง</label>
                            <AdminInput
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="เช่น วัด..."
                                theme="green"
                            />
                        </div>
                        <div>
                            <label htmlFor="area" className="block text-sm font-medium text-neutral-700 mb-1">พื้นที่ (อำเภอ/ตำบล)</label>
                            <AdminInput
                                id="area"
                                type="text"
                                value={formData.area || ""}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                placeholder="เช่น อ.หาดใหญ่"
                                theme="green"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">ที่ตั้ง (Google Maps Link หรือที่อยู่)</label>
                        <AdminInput
                            id="location"
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="https://maps.google.com/..."
                            theme="green"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">สถานะ</label>
                            <AdminSelect
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                theme="green"
                            >
                                <option value="open">🟢 เปิดรับ (Open)</option>
                                <option value="full">🟡 เต็ม (Full)</option>
                                <option value="closed">🔴 ปิด (Closed)</option>
                            </AdminSelect>
                        </div>
                        <div>
                            <label htmlFor="icon" className="block text-sm font-medium text-neutral-700 mb-1">ไอคอน (Emoji)</label>
                            <AdminInput
                                id="icon"
                                type="text"
                                value={formData.icon || "🏠"}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🏠"
                                theme="green"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="contacts" className="block text-sm font-medium text-neutral-700 mb-1">ผู้ติดต่อ</label>
                        <div id="contacts" className="space-y-2">
                            {formData.contacts?.map((contact, index) => (
                                <div key={contact.id} className="flex gap-2">
                                    <AdminInput
                                        aria-label={`ชื่อผู้ติดต่อ ${index + 1}`}
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                                        className="flex-1"
                                        placeholder="ชื่อผู้ติดต่อ"
                                        theme="green"
                                    />
                                    <AdminInput
                                        aria-label={`เบอร์โทรผู้ติดต่อ ${index + 1}`}
                                        type="text"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                        className="flex-1"
                                        placeholder="เบอร์โทร"
                                        theme="green"
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeContactField(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="ลบผู้ติดต่อ"
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
                        <label htmlFor="link" className="block text-sm font-medium text-neutral-700 mb-1">ลิงก์เพิ่มเติม (ถ้ามี)</label>
                        <AdminInput
                            id="link"
                            type="text"
                            value={formData.link || ""}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            placeholder="https://..."
                            theme="green"
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
