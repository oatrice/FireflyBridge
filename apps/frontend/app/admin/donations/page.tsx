"use client";

import { AdminModal } from "@/components/ui/AdminModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import type { DonationChannel } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { AdminInput } from "@/components/ui/AdminInput";
import { AdminTextarea } from "@/components/ui/AdminTextarea";

interface DonationForm {
    name: string;
    bankAccounts: { id: string; bankName: string; accountNumber: string; accountName: string }[];
    description: string;
    images: string[];
    contacts: { id: string; name: string; phone: string; type: string }[];
    donationPoints: { id: string; value: string }[];
    acceptsMoney: boolean;
}

const generateId = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
};

export default function DonationsAdminPage() {
    const initialFormData: DonationForm = {
        name: "",
        bankAccounts: [{ id: generateId(), bankName: "", accountNumber: "", accountName: "" }],
        description: "",
        images: [],
        contacts: [{ id: generateId(), name: "", phone: "", type: "เบอร์โทรศัพท์" }],
        donationPoints: [{ id: generateId(), value: "" }],
        acceptsMoney: true,
    };

    const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await fetch("/api/banks");
                if (res.ok) {
                    const data = await res.json();
                    setBankOptions(data);
                }
            } catch (error) {
                console.error("Failed to fetch banks:", error);
            }
        };
        fetchBanks();
    }, []);

    const transformPayload = (data: DonationForm) => {
        const cleanedContacts = data.contacts
            ?.filter(c => c.name.trim() !== "" || c.phone.trim() !== "")
            .map(({ name, phone, type }) => ({ name, phone, type })) || [];

        const cleanedPoints = data.donationPoints
            ?.filter(p => p.value.trim() !== "")
            .map(p => p.value) || [];

        const cleanedBankAccounts = data.bankAccounts
            ?.filter(b => b.bankName !== "" || b.accountNumber.trim() !== "" || b.accountName.trim() !== "")
            .map(({ bankName, accountNumber, accountName }) => ({ bankName, accountNumber, accountName })) || [];

        return {
            ...data,
            contacts: cleanedContacts,
            donationPoints: cleanedPoints,
            bankAccounts: cleanedBankAccounts,
            images: data.images || [],
        };
    };

    const transformEditData = (donation: DonationChannel): DonationForm => {
        // Migrate legacy single bank account to array if array is empty
        let bankAccounts = donation.bankAccounts && donation.bankAccounts.length > 0
            ? donation.bankAccounts.map(b => ({ ...b, id: generateId() }))
            : [];

        if (bankAccounts.length === 0 && (donation.bankName || donation.accountNumber)) {
            bankAccounts.push({
                id: generateId(),
                bankName: donation.bankName || "",
                accountNumber: donation.accountNumber || "",
                accountName: donation.accountName || ""
            });
        }

        if (bankAccounts.length === 0) {
            bankAccounts.push({ id: generateId(), bankName: "", accountNumber: "", accountName: "" });
        }

        // Migrate legacy qrCodeUrl to images
        const images = [...(donation.images || [])];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((donation as any).qrCodeUrl && !images.includes((donation as any).qrCodeUrl)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            images.unshift((donation as any).qrCodeUrl);
        }

        return {
            ...donation,
            bankAccounts,
            description: donation.description || "",
            images,
            acceptsMoney: donation.acceptsMoney || false,
            contacts: donation.contacts && donation.contacts.length > 0
                ? donation.contacts.map(c => ({ ...c, id: generateId(), type: c.type || "เบอร์โทรศัพท์" }))
                : [{ id: generateId(), name: "", phone: "", type: "เบอร์โทรศัพท์" }],
            donationPoints: donation.donationPoints && donation.donationPoints.length > 0
                ? donation.donationPoints.map(p => ({ id: generateId(), value: p }))
                : [{ id: generateId(), value: "" }],
        };
    };

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
    const updateContact = (index: number, field: 'name' | 'phone' | 'type', value: string) => {
        const newContacts = [...formData.contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContactField = () => {
        setFormData({ ...formData, contacts: [...formData.contacts, { id: generateId(), name: "", phone: "", type: "เบอร์โทรศัพท์" }] });
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

    const updateBankAccount = (index: number, field: 'bankName' | 'accountNumber' | 'accountName', value: string) => {
        const newBankAccounts = [...formData.bankAccounts];
        newBankAccounts[index] = { ...newBankAccounts[index], [field]: value };
        setFormData({ ...formData, bankAccounts: newBankAccounts });
    };

    const addBankAccount = () => {
        setFormData({ ...formData, bankAccounts: [...formData.bankAccounts, { id: generateId(), bankName: "", accountNumber: "", accountName: "" }] });
    };

    const removeBankAccount = (index: number) => {
        const newBankAccounts = [...formData.bankAccounts];
        newBankAccounts.splice(index, 1);
        setFormData({ ...formData, bankAccounts: newBankAccounts });
    };

    const readFiles = async (files: FileList): Promise<string[]> => {
        const promises = Array.from(files).map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });
        return Promise.all(promises);
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const results = await readFiles(files);
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...results]
        }));
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const updateBankAccounts = (currentAccounts: DonationForm['bankAccounts'], parsed: any, bankOptions: { value: string; label: string }[]) => {
        const newAccounts = [...currentAccounts];
        const firstAccount = newAccounts[0];
        const isFirstEmpty = !firstAccount.accountNumber && !firstAccount.bankName;

        if (isFirstEmpty) {
            newAccounts[0] = {
                ...firstAccount,
                accountNumber: parsed.accountNumber || firstAccount.accountNumber,
                bankName: parsed.bankName ? bankOptions.find(b => b.label.includes(parsed.bankName) || parsed.bankName.includes(b.label))?.value || "" : firstAccount.bankName,
                accountName: parsed.accountName || firstAccount.accountName
            };
        } else if (parsed.accountNumber || parsed.bankName) {
            newAccounts.push({
                id: generateId(),
                accountNumber: parsed.accountNumber || "",
                bankName: parsed.bankName ? bankOptions.find(b => b.label.includes(parsed.bankName) || parsed.bankName.includes(b.label))?.value || "" : "",
                accountName: parsed.accountName || ""
            });
        }
        return newAccounts;
    };

    const updateContacts = (currentContacts: DonationForm['contacts'], parsedContacts: any[]) => {
        const newContacts = [...currentContacts];
        if (newContacts.length === 1 && !newContacts[0].name && !newContacts[0].phone) {
            newContacts.pop();
        }

        parsedContacts.forEach((c: any) => {
            const exists = newContacts.some(existing => existing.phone === c.value);
            if (!exists) {
                newContacts.push({
                    id: generateId(),
                    type: c.type || "เบอร์โทรศัพท์",
                    name: '',
                    phone: c.value
                });
            }
        });

        if (newContacts.length === 0) {
            newContacts.push({ id: generateId(), name: "", phone: "", type: "เบอร์โทรศัพท์" });
        }
        return newContacts;
    };

    const handleAutoFill = async (imageUrl: string) => {
        setIsProcessingOCR(true);
        try {
            const res = await fetch("/api/extract-donation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageUrl }),
            });

            if (!res.ok) throw new Error("Failed to extract data");

            const parsed = await res.json();

            if (parsed.accountNumber || parsed.bankName || parsed.name || (parsed.contacts && parsed.contacts.length > 0)) {
                setFormData(prev => {
                    const newState = { ...prev };

                    // 1. Name & Description
                    if (!newState.name && parsed.name) newState.name = parsed.name;
                    if (!newState.description && parsed.description) newState.description = parsed.description;

                    // 2. Bank Accounts
                    newState.bankAccounts = updateBankAccounts(newState.bankAccounts, parsed, bankOptions);

                    // 3. Contacts
                    if (parsed.contacts && parsed.contacts.length > 0) {
                        newState.contacts = updateContacts(newState.contacts, parsed.contacts);
                    }

                    return newState;
                });

                const summary = [
                    parsed.name ? `ชื่อ: ${parsed.name}` : null,
                    parsed.bankName ? `ธนาคาร: ${parsed.bankName}` : null,
                    parsed.accountNumber ? `เลขบัญชี: ${parsed.accountNumber}` : null,
                    parsed.accountName ? `ชื่อบัญชี: ${parsed.accountName}` : null,
                    parsed.contacts?.length > 0 ? `ผู้ติดต่อ: ${parsed.contacts.length} รายการ` : null
                ].filter(Boolean).join('\n');

                alert(`ดึงข้อมูลสำเร็จ (AI):\n${summary}`);
            } else {
                alert("AI ไม่พบข้อมูลที่สามารถระบุได้ในรูปภาพนี้");
            }
        } catch (error) {
            console.error("AI Extraction Failed:", error);
            alert("เกิดข้อผิดพลาดในการดึงข้อมูลจากรูปภาพ");
        } finally {
            setIsProcessingOCR(false);
        }
    };

    if (loading) return <LoadingSpinner color="border-purple-600" />;

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
                                        {/* Display multiple bank accounts or fallback to legacy */}
                                        {(() => {
                                            if (donation.bankAccounts && donation.bankAccounts.length > 0) {
                                                return (
                                                    <div className="flex flex-col gap-2">
                                                        {donation.bankAccounts.map((bank, idx) => (
                                                            <div key={bank.id || `${bank.bankName}-${bank.accountNumber}-${idx}`} className="text-sm border-b border-neutral-100 last:border-0 pb-1 last:pb-0">
                                                                <div className="font-medium text-neutral-900">{bank.bankName}</div>
                                                                <div className="text-neutral-600 font-mono">{bank.accountNumber}</div>
                                                                <div className="text-neutral-500 text-xs">{bank.accountName}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            } else if (donation.bankName) {
                                                return (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-neutral-900">{donation.bankName}</div>
                                                        <div className="text-neutral-600 font-mono">{donation.accountNumber}</div>
                                                        <div className="text-neutral-500 text-xs">{donation.accountName}</div>
                                                    </div>
                                                );
                                            } else {
                                                return <span className="text-neutral-400 text-sm">-</span>;
                                            }
                                        })()}
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
                        <label htmlFor="gallery" className="block text-sm font-medium text-neutral-700 mb-1">รูปภาพ (Images)</label>
                        <div className="space-y-4">
                            <input
                                id="gallery"
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryUpload}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-6 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors flex flex-col items-center justify-center gap-2 text-purple-600 cursor-pointer"
                            >
                                <span className="text-2xl">☁️</span>
                                <span className="font-medium">คลิกเพื่อ Upload ไฟล์รูปภาพ</span>
                            </button>

                            {formData.images && formData.images.length > 0 && (
                                <div className="flex flex-wrap gap-4">
                                    {formData.images.map((img, index) => (
                                        <div key={img} className="w-24 h-24 relative border rounded overflow-hidden shrink-0 group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt={`Gallery item ${index + 1}`} className="object-cover w-full h-full" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAutoFill(img)}
                                                    className="text-white hover:text-purple-200 text-xs flex items-center gap-1 bg-purple-600/80 px-2 py-1 rounded"
                                                    title="ดึงข้อมูลจากรูป"
                                                    disabled={isProcessingOCR}
                                                >
                                                    {isProcessingOCR ? "..." : "✨ Auto"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="text-white hover:text-red-200 text-xs bg-red-600/80 px-2 py-1 rounded"
                                                    title="ลบรูปภาพ"
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">ชื่อหน่วยงาน/โครงการ</label>
                        <AdminInput
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="เช่น สภากาชาดไทย..."
                            theme="purple"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">รายละเอียด</label>
                        <AdminTextarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-20"
                            placeholder="รายละเอียดโครงการ..."
                            theme="purple"
                        />
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-4">
                        <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                            <span>💰</span> ข้อมูลบัญชีธนาคาร (ถ้ามี)
                        </h3>
                        <div className="space-y-4">
                            {formData.bankAccounts.map((account, index) => (
                                <div key={account.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 relative">
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeBankAccount(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                            title="ลบบัญชี"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`bankName-${index}`} className="block text-sm font-medium text-neutral-700 mb-1">ธนาคาร</label>
                                            <select
                                                id={`bankName-${index}`}
                                                aria-label="ธนาคาร"
                                                value={account.bankName || ""}
                                                onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-neutral-900"
                                            >
                                                <option key="default" value="">เลือกธนาคาร...</option>
                                                {bankOptions.map((bank) => (
                                                    <option key={bank.value} value={bank.value}>
                                                        {bank.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor={`accountNumber-${index}`} className="block text-sm font-medium text-neutral-700 mb-1">เลขที่บัญชี</label>
                                            <AdminInput
                                                id={`accountNumber-${index}`}
                                                type="text"
                                                value={account.accountNumber || ""}
                                                onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                                                placeholder="xxx-x-xxxxx-x"
                                                theme="purple"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor={`accountName-${index}`} className="block text-sm font-medium text-neutral-700 mb-1">ชื่อบัญชี</label>
                                            <AdminInput
                                                id={`accountName-${index}`}
                                                type="text"
                                                value={account.accountName || ""}
                                                onChange={(e) => updateBankAccount(index, 'accountName', e.target.value)}
                                                placeholder="ชื่อบัญชี..."
                                                theme="purple"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addBankAccount}
                                className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                            >
                                <span>➕</span> เพิ่มบัญชีธนาคาร
                            </button>
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
                                    <AdminInput
                                        aria-label={`จุดรับบริจาค ${index + 1}`}
                                        type="text"
                                        value={point.value}
                                        onChange={(e) => updatePoint(index, e.target.value)}
                                        className="flex-1"
                                        placeholder="ระบุสถานที่รับบริจาค..."
                                        theme="purple"
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
                                    <div className="w-1/3">
                                        <select
                                            aria-label={`ประเภทการติดต่อ ${index + 1}`}
                                            value={contact.type}
                                            onChange={(e) => updateContact(index, 'type', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-neutral-900"
                                        >
                                            <option key="phone" value="เบอร์โทรศัพท์">เบอร์โทรศัพท์</option>
                                            <option key="line" value="Line">Line</option>
                                            <option key="facebook" value="Facebook">Facebook</option>
                                            <option key="website" value="Website">Website</option>
                                            <option key="other" value="Other">อื่นๆ</option>
                                        </select>
                                    </div>
                                    <AdminInput
                                        aria-label={`ชื่อผู้ติดต่อ ${index + 1}`}
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                                        className="flex-1"
                                        placeholder="ชื่อ/รายละเอียด"
                                        theme="purple"
                                    />
                                    <AdminInput
                                        aria-label={`ข้อมูลติดต่อ ${index + 1}`}
                                        type="text"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                        className="flex-1"
                                        placeholder="เบอร์โทร/ID/Link"
                                        theme="purple"
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
