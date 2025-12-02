import { useState, useEffect, useCallback } from 'react';

export function useAdminCrud<T extends { id: string }, F = Partial<T>>(
    apiEndpoint: string,
    initialFormData: F,
    transformPayload?: (data: F) => any,
    transformEditData?: (data: T) => F
) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [formData, setFormData] = useState<F>(initialFormData);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(apiEndpoint);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            } else {
                console.error(`Failed to fetch from ${apiEndpoint}, status:`, res.status);
            }
        } catch (error) {
            console.error(`Failed to fetch from ${apiEndpoint}:`, error);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = transformPayload ? transformPayload(formData) : formData;

        try {
            const url = editingItem
                ? `${apiEndpoint}/${editingItem.id}`
                : apiEndpoint;
            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData(initialFormData);
                fetchData();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to save item:", errorData);
                alert(`Failed to save item: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error saving item:", error);
            alert("An error occurred while saving the item. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const res = await fetch(`${apiEndpoint}/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchData();
            } else {
                console.error("Failed to delete item, status:", res.status);
                alert("Failed to delete item. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("An error occurred while deleting the item.");
        }
    };

    const handleEdit = (item: T) => {
        setEditingItem(item);
        setFormData(transformEditData ? transformEditData(item) : (item as unknown as F));
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    return {
        items,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingItem,
        formData,
        setFormData,
        handleSubmit,
        handleDelete,
        handleEdit,
        handleCreate,
        fetchData
    };
}
