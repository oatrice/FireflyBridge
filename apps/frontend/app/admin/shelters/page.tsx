"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminModal } from "@/components/ui/AdminModal";

interface Shelter {
    id: number;
    name: string;
    location: string;
    status: string;
    contacts: { name: string; phone: string }[];
    area?: string;
    icon?: string;
    link?: string;
}

export default function AdminSheltersPage() {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        status: "open",
        contacts: [{ name: "", phone: "" }],
        area: "",
        icon: "",
        link: "",
    });

    useEffect(() => {
        fetchShelters();
    }, []);

    const fetchShelters = async () => {
        try {
            const res = await fetch("/api/admin/shelters");
            if (res.ok) {
                const data = await res.json();
                setShelters(data);
            }
        } catch (error) {
            console.error("Failed to fetch shelters", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            id: editingShelter?.id,
        };

        try {
            const method = editingShelter ? "PUT" : "POST";
            const res = await fetch("/api/admin/shelters", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchShelters();
                closeDialog();
            } else {
                alert("Failed to save shelter");
            }
        } catch (error) {
            console.error("Error saving shelter", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this shelter?")) return;

        try {
            const res = await fetch(`/api/admin/shelters?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchShelters();
            } else {
                alert("Failed to delete shelter");
            }
        } catch (error) {
            console.error("Error deleting shelter", error);
        }
    };

    const openDialog = (shelter?: Shelter) => {
        if (shelter) {
            setEditingShelter(shelter);
            setFormData({
                name: shelter.name,
                location: shelter.location,
                status: shelter.status,
                contacts: shelter.contacts && shelter.contacts.length > 0 ? shelter.contacts : [{ name: "", phone: "" }],
                area: shelter.area || "",
                icon: shelter.icon || "",
                link: shelter.link || "",
            });
        } else {
            setEditingShelter(null);
            setFormData({
                name: "",
                location: "",
                status: "open",
                contacts: [{ name: "", phone: "" }],
                area: "",
                icon: "",
                link: "",
            });
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingShelter(null);
    };

    const handleContactChange = (index: number, field: "name" | "phone", value: string) => {
        const newContacts = [...formData.contacts];
        newContacts[index][field] = value;
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContact = () => {
        setFormData({ ...formData, contacts: [...formData.contacts, { name: "", phone: "" }] });
    };

    const removeContact = (index: number) => {
        const newContacts = formData.contacts.filter((_, i) => i !== index);
        setFormData({ ...formData, contacts: newContacts });
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
                        <h1 className="text-3xl font-bold text-gray-900">Manage Shelters</h1>
                    </div>
                    <button
                        onClick={() => openDialog()}
                        className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                        + Add Shelter
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contacts</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shelters.map((shelter) => (
                                <tr key={shelter.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{shelter.name}</div>
                                        <div className="text-sm text-gray-700">{shelter.area}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {shelter.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shelter.status === 'open' ? 'bg-green-100 text-green-900' :
                                            shelter.status === 'full' ? 'bg-yellow-100 text-yellow-900' :
                                                'bg-red-100 text-red-900'
                                            }`}>
                                            {shelter.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700">
                                            {shelter.contacts?.map((c, i) => (
                                                <div key={i}>{c.name}: {c.phone}</div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openDialog(shelter)}
                                            className="text-indigo-700 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(shelter.id)}
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
            {/* Dialog */}
            <AdminModal
                isOpen={isDialogOpen}
                onClose={closeDialog}
                title={editingShelter ? "Edit Shelter" : "Add New Shelter"}
                maxWidth="max-w-lg"
            >
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
                        <label className="block text-sm font-medium text-gray-900">Location (Map Link or Address)</label>
                        <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900 placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Area</label>
                        <input
                            type="text"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900 placeholder-gray-600"
                            placeholder="e.g. Hat Yai"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900"
                        >
                            <option value="open">Open</option>
                            <option value="full">Full</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Contacts</label>
                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) => handleContactChange(index, "name", e.target.value)}
                                    className="flex-1 rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-sm text-gray-900 placeholder-gray-600"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={contact.phone}
                                    onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                                    className="flex-1 rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-sm text-gray-900 placeholder-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeContact(index)}
                                    className="text-red-700 hover:text-red-900 px-2"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addContact}
                            className="text-sm text-blue-700 hover:text-blue-900"
                        >
                            + Add Contact
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900">Link (Optional)</label>
                        <input
                            type="text"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-700 focus:ring-blue-700 border p-2 text-gray-900 placeholder-gray-600"
                        />
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
            </AdminModal>
        </div>
    );
}
