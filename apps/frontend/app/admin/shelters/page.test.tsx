import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SheltersAdminPage from './page';

// Mock AdminModal
jest.mock('@/components/ui/AdminModal', () => {
    return {
        AdminModal: ({ children, isOpen, title }: any) => (
            isOpen ? (
                <div role="dialog">
                    <h2>{title}</h2>
                    {children}
                </div>
            ) : null
        ),
    };
});

// Mock global fetch
global.fetch = jest.fn() as unknown as typeof fetch;

describe('SheltersAdminPage', () => {
    const mockShelters = [
        {
            id: '1',
            name: 'Test Shelter',
            location: 'Test Location',
            status: 'open',
            contacts: [{ name: 'Contact 1', phone: '0812345678' }],
            area: 'Test Area',
            icon: '🏠',
            link: 'https://example.com',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as unknown as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockShelters,
        });
    });

    it('renders shelters list', async () => {
        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Shelter')).toBeInTheDocument();
            expect(screen.getByText('📍 Test Location')).toBeInTheDocument();
        });
    });

    it('opens modal when clicking add button', async () => {
        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('เพิ่มศูนย์พักพิงใหม่')).toBeInTheDocument();
    });

    it('opens modal with data when clicking edit button', async () => {
        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('แก้ไขข้อมูลศูนย์พักพิง')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Shelter')).toBeInTheDocument();
    });

    it('handles delete', async () => {
        // Mock confirm
        window.confirm = jest.fn(() => true);
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/shelters') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockShelters,
                });
            }
            if (url === '/api/shelters/1' && options?.method === 'DELETE') {
                return Promise.resolve({ ok: true });
            }
            return Promise.resolve({ ok: false });
        });

        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('ลบ')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('ลบ'));

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/shelters/1', expect.objectContaining({ method: 'DELETE' }));
        });
    });

    it('handles add shelter submission', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/shelters' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ ...mockShelters[0], id: '2', name: 'New Shelter' }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockShelters,
            });
        });

        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('เช่น วัด...'), { target: { value: 'New Shelter' } });
        fireEvent.change(screen.getByPlaceholderText('https://maps.google.com/...'), { target: { value: 'New Location' } });

        // Submit
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/shelters', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('New Shelter')
            }));
        });
    });

    it('handles edit shelter submission', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/shelters/1' && options?.method === 'PUT') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ ...mockShelters[0], name: 'Updated Shelter' }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockShelters,
            });
        });

        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        // Change value
        fireEvent.change(screen.getByDisplayValue('Test Shelter'), { target: { value: 'Updated Shelter' } });

        // Submit
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/shelters/1', expect.objectContaining({
                method: 'PUT',
                body: expect.stringContaining('Updated Shelter')
            }));
        });
    });

    it('handles dynamic contact fields', async () => {
        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Add contact
        const addContactBtn = screen.getByText('เพิ่มผู้ติดต่อ');
        fireEvent.click(addContactBtn);

        // Check if we have multiple contact name inputs
        const inputs = screen.getAllByPlaceholderText('ชื่อผู้ติดต่อ');
        expect(inputs).toHaveLength(2);
    });

    it('removes contact field', async () => {
        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Add contact first to have 2 fields
        const addContactBtn = screen.getByText('เพิ่มผู้ติดต่อ');
        fireEvent.click(addContactBtn);

        const inputsBefore = screen.getAllByPlaceholderText('ชื่อผู้ติดต่อ');
        expect(inputsBefore).toHaveLength(2);

        // Remove the second contact (index 1)
        const removeBtns = screen.getAllByTitle('ลบผู้ติดต่อ');
        fireEvent.click(removeBtns[0]); // The first remove button corresponds to the second input (index 1)

        const inputsAfter = screen.getAllByPlaceholderText('ชื่อผู้ติดต่อ');
        expect(inputsAfter).toHaveLength(1);
    });

    it('filters empty contacts on submission', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/shelters' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ ...mockShelters[0], id: '3', name: 'Filtered Shelter' }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockShelters,
            });
        });

        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        fireEvent.change(screen.getByPlaceholderText('เช่น วัด...'), { target: { value: 'Filtered Shelter' } });
        fireEvent.change(screen.getByPlaceholderText('https://maps.google.com/...'), { target: { value: 'Location' } });

        // First contact is empty by default

        // Add another contact and leave it empty
        fireEvent.click(screen.getByText('เพิ่มผู้ติดต่อ'));

        // Submit
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/shelters', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"contacts":[]') // Should be empty array or filtered
            }));
        });
    });

    it('renders correct status badges', async () => {
        const statusMockShelters = [
            { ...mockShelters[0], id: '1', status: 'open' },
            { ...mockShelters[0], id: '2', status: 'full' },
            { ...mockShelters[0], id: '3', status: 'closed' },
            { ...mockShelters[0], id: '4', status: 'unknown' },
        ];

        (global.fetch as unknown as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => statusMockShelters,
        });

        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เปิดรับ')).toBeInTheDocument();
            expect(screen.getByText('เต็ม')).toBeInTheDocument();
            expect(screen.getByText('ปิด')).toBeInTheDocument();
            expect(screen.getByText('unknown')).toBeInTheDocument();
        });
    });

    it('handles API error on update', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/shelters/1' && options?.method === 'PUT') {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: async () => ({}),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockShelters,
            });
        });

        window.alert = jest.fn();

        render(<SheltersAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to save item: Unknown error');
        });
    });
});
