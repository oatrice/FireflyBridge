"use client";

import { AdminModal } from "@/components/ui/AdminModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import type { Hotline } from "@/lib/types";

interface HotlineForm {
    name: string;
    numbers: { id: string; value: string }[];
    category: string;
    description: string;
    color: string;
    isPopular: boolean;
}

const generateId = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
};

export default function HotlinesAdminPage() {
    const initialFormData: HotlineForm = {
        name: "",
        numbers: [{ id: generateId(), value: "" }],
        category: "ทั่วไป",
        description: "",
        color: "bg-gray-500",
        isPopular: false,
    };

    const transformPayload = (data: HotlineForm) => {
        const cleanedNumbers = data.numbers
            ?.filter(n => n.value.trim() !== "")
            .map(n => n.value) || [];
        return { ...data, numbers: cleanedNumbers };
    };

    const transformEditData = (hotline: Hotline): HotlineForm => {
        let numbers: { id: string; value: string }[];

        if (hotline.numbers && hotline.numbers.length > 0) {
            numbers = hotline.numbers.map(n => ({ id: generateId(), value: n }));
        } else if (hotline.number) {
            numbers = [{ id: generateId(), value: hotline.number }];
        } else {
            numbers = [{ id: generateId(), value: "" }];
        }

        return {
            ...hotline,
            description: hotline.description || "",
            color: hotline.color || "bg-gray-500",
            isPopular: hotline.isPopular || false,
            numbers,
        };
    };

    const {
        items: hotlines,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingItem: editingHotline,
        formData,
        setFormData,
        handleSubmit,
        handleDelete,
        handleEdit,
        handleCreate
    } = useAdminCrud<Hotline, HotlineForm>(
        "/api/hotlines",
        initialFormData,
        transformPayload,
        transformEditData
    );

    // Helper to update numbers array
    const updateNumber = (index: number, value: string) => {
        const newNumbers = [...formData.numbers];
        newNumbers[index] = { ...newNumbers[index], value };
        setFormData({ ...formData, numbers: newNumbers });
    };

    const addNumberField = () => {
        setFormData({ ...formData, numbers: [...formData.numbers, { id: generateId(), value: "" }] });
    };

    const removeNumberField = (index: number) => {
        const newNumbers = [...formData.numbers];
        newNumbers.splice(index, 1);
        setFormData({ ...formData, numbers: newNumbers });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">จัดการเบอร์โทรฉุกเฉิน (Hotlines)</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                                <th className="px-6 py-4 font-semibold text-neutral-700">เบอร์โทร</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700">หมวดหมู่</th>
                                <th className="px-6 py-4 font-semibold text-neutral-700 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {hotlines.map((hotline) => (
                                <tr key={hotline.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900">{hotline.name}</div>
                                        {hotline.description && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs">{hotline.description}</div>
                                        )}
                                        {hotline.isPopular && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                ⭐ ยอดฮิต
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {hotline.numbers?.map((num, idx) => (
                                                <span key={`${num}-${idx}`} className="text-neutral-600 font-mono bg-neutral-100 px-2 py-0.5 rounded w-fit text-sm">
                                                    {num}
                                                </span>
                                            )) || (hotline.number && (
                                                <span className="text-neutral-600 font-mono bg-neutral-100 px-2 py-0.5 rounded w-fit text-sm">
                                                    {hotline.number}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${hotline.color}`}>
                                            {hotline.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(hotline)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(hotline.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {hotlines.length === 0 && (
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
                title={editingHotline ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลใหม่"}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">ชื่อหน่วยงาน</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="เช่น มูลนิธิกู้ภัย..."
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">หมวดหมู่</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="ทั่วไป">ทั่วไป</option>
                            <option value="มูลนิธิ">มูลนิธิ</option>
                            <option value="อาสาสมัคร">อาสาสมัคร</option>
                            <option value="ท้องถิ่น">ท้องถิ่น</option>
                            <option value="โรงพยาบาล">โรงพยาบาล</option>
                            <option value="ตำรวจ">ตำรวจ</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="numbers" className="block text-sm font-medium text-neutral-700 mb-1">เบอร์โทรศัพท์</label>
                        <div id="numbers" className="space-y-2">
                            {formData.numbers?.map((num, index) => (
                                <div key={num.id} className="flex gap-2">
                                    <input
                                        aria-label={`เบอร์โทรศัพท์ ${index + 1}`}
                                        type="text"
                                        name={`numbers.${index}`}
                                        value={num.value}
                                        onChange={(e) => updateNumber(index, e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="08x-xxx-xxxx"
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeNumberField(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="ลบเบอร์โทร"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addNumberField}
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <span>➕</span> เพิ่มเบอร์โทร
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">รายละเอียดเพิ่มเติม</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24"
                            placeholder="รายละเอียดเกี่ยวกับหน่วยงาน หรือพื้นที่ให้บริการ..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-neutral-700 mb-1">สีป้ายกำกับ (Tailwind Class)</label>
                            <input
                                id="color"
                                type="text"
                                name="color"
                                value={formData.color || ""}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="bg-blue-500"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPopular || false}
                                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                    className="w-5 h-5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-neutral-700">แสดงในหมวดยอดฮิต</span>
                            </label>
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
