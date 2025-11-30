"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
                        <Link href="/admin" className="text-blue-600 hover:underline mb-2 inline-block">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Shelters</h1>
                    </div>
                    <button
                        onClick={() => openDialog()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Add Shelter
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shelters.map((shelter) => (
                                <tr key={shelter.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{shelter.name}</div>
                                        <div className="text-sm text-gray-500">{shelter.area}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {shelter.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shelter.status === 'open' ? 'bg-green-100 text-green-800' :
                                                shelter.status === 'full' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {shelter.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {shelter.contacts?.map((c, i) => (
                                                <div key={i}>{c.name}: {c.phone}</div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openDialog(shelter)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(shelter.id)}
                                            className="text-red-600 hover:text-red-900"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 my-8">
                        <h2 className="text-xl font-bold mb-4">
                            {editingShelter ? "Edit Shelter" : "Add New Shelter"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location (Map Link or Address)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Area</label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g. Hat Yai"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="open">Open</option>
                                    <option value="full">Full</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contacts</label>
                                {formData.contacts.map((contact, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={contact.name}
                                            onChange={(e) => handleContactChange(index, "name", e.target.value)}
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Phone"
                                            value={contact.phone}
                                            onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeContact(index)}
                                            className="text-red-600 hover:text-red-800 px-2"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addContact}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    + Add Contact
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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
