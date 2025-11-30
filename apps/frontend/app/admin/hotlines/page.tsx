"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Hotline {
    id: string;
    name: string;
    numbers: string[];
    category: string;
    description?: string;
    color?: string;
}

const getBadgeColor = (color?: string) => {
    const c = color?.toLowerCase() || "blue";
    if (c.includes("red")) return "bg-red-700 text-white";
    if (c.includes("green")) return "bg-green-700 text-white";
    if (c.includes("yellow")) return "bg-yellow-300 text-black";
    if (c.includes("purple")) return "bg-purple-700 text-white";
    if (c.includes("cyan")) return "bg-cyan-700 text-white";
    if (c.includes("orange")) return "bg-orange-700 text-white";
    if (c.includes("gray")) return "bg-gray-700 text-white";
    return "bg-blue-700 text-white";
};

export default function AdminHotlinesPage() {
    const [hotlines, setHotlines] = useState<Hotline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHotline, setEditingHotline] = useState<Hotline | null>(null);
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        numbers: "",
        category: "general",
        description: "",
        color: "blue",
    });

    useEffect(() => {
        fetchHotlines();
    }, []);

    const fetchHotlines = async () => {
        try {
            const res = await fetch("/api/admin/hotlines");
            if (res.ok) {
                const data = await res.json();
                setHotlines(data);
            }
        } catch (error) {
            console.error("Failed to fetch hotlines", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numbersArray = formData.numbers.split(",").map((n) => n.trim()).filter(Boolean);

        const payload = {
            ...formData,
            numbers: numbersArray,
            id: editingHotline?.id,
        };

        try {
            const method = editingHotline ? "PUT" : "POST";
            const res = await fetch("/api/admin/hotlines", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchHotlines();
                closeDialog();
            } else {
                alert("Failed to save hotline");
            }
        } catch (error) {
            console.error("Error saving hotline", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this hotline?")) return;

        try {
            const res = await fetch(`/api/admin/hotlines?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchHotlines();
            } else {
                alert("Failed to delete hotline");
            }
        } catch (error) {
            console.error("Error deleting hotline", error);
        }
    };

    const openDialog = (hotline?: Hotline) => {
        if (hotline) {
            setEditingHotline(hotline);
            setFormData({
                name: hotline.name,
                numbers: hotline.numbers.join(", "),
                category: hotline.category,
                description: hotline.description || "",
                color: hotline.color || "blue",
            });
        } else {
            setEditingHotline(null);
            setFormData({
                name: "",
                numbers: "",
                category: "general",
                description: "",
                color: "blue",
            });
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingHotline(null);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/admin" className="text-blue-700 hover:underline mb-2 inline-block">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Hotlines</h1>
                    </div>
                    <button
                        onClick={() => openDialog()}
                        className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                        + Add Hotline
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Numbers</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {hotlines.map((hotline) => (
                                <tr key={hotline.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{hotline.name}</div>
                                        <div className="text-sm text-gray-700">{hotline.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {hotline.numbers.map((num, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(hotline.color)}`}>
                                            {hotline.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openDialog(hotline)}
                                            className="text-indigo-700 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(hotline.id)}
                                            className="text-red-700 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            {editingHotline ? "Edit Hotline" : "Add New Hotline"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900 placeholder-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Numbers (comma separated)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.numbers}
                                    onChange={(e) => setFormData({ ...formData, numbers: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900 placeholder-gray-600"
                                    placeholder="02-123-4567, 191"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900"
                                >
                                    <option value="general">General</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="medical">Medical</option>
                                    <option value="utilities">Utilities</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900 placeholder-gray-600"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Color</label>
                                <select
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900"
                                >
                                    <option value="blue">Blue</option>
                                    <option value="red">Red</option>
                                    <option value="green">Green</option>
                                    <option value="yellow">Yellow</option>
                                    <option value="purple">Purple</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
