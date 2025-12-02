"use client";

import { AdminModal } from "@/components/ui/AdminModal";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import type { DonationChannel } from "@/lib/types";

interface DonationForm {
    name: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    description: string;
    qrCodeUrl: string;
    contacts: { id: string; name: string; phone: string }[];
    donationPoints: { id: string; value: string }[];
    acceptsMoney: boolean;
}

const generateId = () => Math.random().toString(36).substring(7);

export default function DonationsAdminPage() {
    const initialFormData: DonationForm = {
        name: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        description: "",
        qrCodeUrl: "",
        contacts: [{ id: generateId(), name: "", phone: "" }],
        donationPoints: [{ id: generateId(), value: "" }],
        acceptsMoney: true,
    };

    const transformPayload = (data: DonationForm) => {
        const cleanedContacts = data.contacts
            ?.filter(c => c.name.trim() !== "" || c.phone.trim() !== "")
            .map(({ name, phone }) => ({ name, phone })) || [];

        const cleanedPoints = data.donationPoints
            ?.filter(p => p.value.trim() !== "")
            .map(p => p.value) || [];

        return {
            ...data,
            contacts: cleanedContacts,
            donationPoints: cleanedPoints
        };
    };

    const transformEditData = (donation: DonationChannel): DonationForm => ({
        ...donation,
        bankName: donation.bankName || "",
        accountNumber: donation.accountNumber || "",
        accountName: donation.accountName || "",
        description: donation.description || "",
        qrCodeUrl: donation.qrCodeUrl || "",
        acceptsMoney: donation.acceptsMoney || false,
        contacts: donation.contacts && donation.contacts.length > 0
            ? donation.contacts.map(c => ({ ...c, id: generateId() }))
            : [{ id: generateId(), name: "", phone: "" }],
        donationPoints: donation.donationPoints && donation.donationPoints.length > 0
            ? donation.donationPoints.map(p => ({ id: generateId(), value: p }))
            : [{ id: generateId(), value: "" }],
    });

    const {
        items: donations,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingItem: editingDonation,
        formData,
        setFormData,
        handleSubmit,
        handleDelete,
        handleEdit,
        handleCreate
    } = useAdminCrud<DonationChannel, DonationForm>(
        "/api/donations",
        initialFormData,
        transformPayload,
        transformEditData
    );

    // Helper functions
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

    const updatePoint = (index: number, value: string) => {
        const newPoints = [...formData.donationPoints];
        newPoints[index] = { ...newPoints[index], value };
        setFormData({ ...formData, donationPoints: newPoints });
    };

    const addPointField = () => {
        setFormData({ ...formData, donationPoints: [...formData.donationPoints, { id: generateId(), value: "" }] });
    };

    const removePointField = (index: number) => {
        const newPoints = [...formData.donationPoints];
        newPoints.splice(index, 1);
        setFormData({ ...formData, donationPoints: newPoints });
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">จัดการการบริจาค (Donations)</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <span>➕</span> เพิ่มข้อมูล
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-neutral-700">ชื่อหน่วยงาน</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">บัญชีธนาคาร</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">จุดรับบริจาค</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {donations.map((donation) => (
                                <tr key={donation.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900">{donation.name}</div>
                                        {donation.description && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs mt-1">{donation.description}</div>
                                        )}
                                        <div className="mt-1 flex gap-2">
                                            {donation.acceptsMoney && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">รับเงินบริจาค</span>
                                            )}
                                            {donation.donationPoints && donation.donationPoints.length > 0 && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">รับสิ่งของ</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {donation.bankName ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-neutral-900">{donation.bankName}</div>
                                                <div className="text-neutral-600 font-mono">{donation.accountNumber}</div>
                                                <div className="text-neutral-500 text-xs">{donation.accountName}</div>
                                            </div>
                                        ) : (
                                            <span className="text-neutral-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {donation.donationPoints && donation.donationPoints.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {donation.donationPoints.slice(0, 2).map((point, idx) => (
                                                    <div key={`${point}-${idx}`} className="text-sm text-neutral-600 truncate max-w-xs">📍 {point}</div>
                                                ))}
                                                {donation.donationPoints.length > 2 && (
                                                    <div className="text-xs text-neutral-400">+{donation.donationPoints.length - 2} จุดเพิ่มเติม</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-neutral-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(donation)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(donation.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {donations.length === 0 && (
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
                title={editingDonation ? "แก้ไขข้อมูลการบริจาค" : "เพิ่มช่องทางบริจาคใหม่"}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">ชื่อหน่วยงาน/โครงการ</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            placeholder="เช่น สภากาชาดไทย..."
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">รายละเอียด</label>
                        <textarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none h-20"
                            placeholder="รายละเอียดโครงการ..."
                        />
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-4">
                        <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                            <span>💰</span> ข้อมูลบัญชีธนาคาร (ถ้ามี)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bankName" className="block text-sm font-medium text-neutral-700 mb-1">ธนาคาร</label>
                                <input
                                    id="bankName"
                                    type="text"
                                    value={formData.bankName || ""}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="เช่น กสิกรไทย"
                                />
                            </div>
                            <div>
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-neutral-700 mb-1">เลขที่บัญชี</label>
                                <input
                                    id="accountNumber"
                                    type="text"
                                    value={formData.accountNumber || ""}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="xxx-x-xxxxx-x"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="accountName" className="block text-sm font-medium text-neutral-700 mb-1">ชื่อบัญชี</label>
                                <input
                                    id="accountName"
                                    type="text"
                                    value={formData.accountName || ""}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="ชื่อบัญชี..."
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.acceptsMoney || false}
                                    onChange={(e) => setFormData({ ...formData, acceptsMoney: e.target.checked })}
                                    className="w-5 h-5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-neutral-700">เปิดรับบริจาคเงิน</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-4">
                        <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                            <span>📦</span> จุดรับบริจาคสิ่งของ (ถ้ามี)
                        </h3>
                        <div className="space-y-2">
                            {formData.donationPoints?.map((point, index) => (
                                <div key={point.id} className="flex gap-2">
                                    <input
                                        aria-label={`จุดรับบริจาค ${index + 1}`}
                                        type="text"
                                        value={point.value}
                                        onChange={(e) => updatePoint(index, e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="ระบุสถานที่รับบริจาค..."
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removePointField(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="ลบจุดรับบริจาค"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addPointField}
                                className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                            >
                                <span>➕</span> เพิ่มจุดรับบริจาค
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-4">
                        <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                            <span>📞</span> ผู้ติดต่อ
                        </h3>
                        <div className="space-y-2">
                            {formData.contacts?.map((contact, index) => (
                                <div key={contact.id} className="flex gap-2">
                                    <input
                                        aria-label={`ชื่อผู้ติดต่อ ${index + 1}`}
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="ชื่อผู้ติดต่อ"
                                    />
                                    <input
                                        aria-label={`เบอร์โทรผู้ติดต่อ ${index + 1}`}
                                        type="text"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="เบอร์โทร"
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
                                className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                            >
                                <span>➕</span> เพิ่มผู้ติดต่อ
                            </button>
                        </div>
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
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
