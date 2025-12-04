import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DonationsAdminPage from './page';

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

describe('DonationsAdminPage', () => {
    const mockDonations = [
        {
            id: '1',
            name: 'Test Donation',
            bankName: 'Test Bank',
            accountNumber: '123-456-7890',
            accountName: 'Test Account',
            description: 'Test Description',

            contacts: [{ name: 'Contact 1', phone: '0812345678' }],
            donationPoints: ['Point 1'],
            acceptsMoney: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as unknown as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockDonations,
        });
    });

    it('renders donations list', async () => {
        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Donation')).toBeInTheDocument();
            expect(screen.getByText('Test Bank')).toBeInTheDocument();
        });
    });

    it('opens modal when clicking add button', async () => {
        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('เพิ่มช่องทางบริจาคใหม่')).toBeInTheDocument();
    });

    it('opens modal with data when clicking edit button', async () => {
        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('แก้ไขข้อมูลการบริจาค')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Donation')).toBeInTheDocument();
    });

    it('handles delete', async () => {
        // Mock confirm
        window.confirm = jest.fn(() => true);
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockDonations,
                });
            }
            if (url === '/api/donations/1' && options?.method === 'DELETE') {
                return Promise.resolve({ ok: true });
            }
            return Promise.resolve({ ok: false });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('ลบ')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('ลบ'));

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/donations/1', expect.objectContaining({ method: 'DELETE' }));
        });
    });

    it('handles add donation submission', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ ...mockDonations[0], id: '2', name: 'New Donation' }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockDonations,
            });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('เช่น สภากาชาดไทย...'), { target: { value: 'New Donation' } });
        fireEvent.change(screen.getByLabelText('ธนาคาร'), { target: { value: 'กสิกรไทย (KBANK)' } });

        // Submit
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/donations', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('New Donation')
            }));
        });
    });

    it('handles edit donation submission', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations/1' && options?.method === 'PUT') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ ...mockDonations[0], name: 'Updated Donation' }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockDonations,
            });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        // Change value
        fireEvent.change(screen.getByDisplayValue('Test Donation'), { target: { value: 'Updated Donation' } });

        // Submit
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/donations/1', expect.objectContaining({
                method: 'PUT',
                body: expect.stringContaining('Updated Donation')
            }));
        });
    });

    it('handles dynamic fields (contacts and points)', async () => {
        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Add contact
        // Use getAllByText because the button text might be inside a span or similar structure that matches multiple times or fuzzy match
        // The button text is "เพิ่มผู้ติดต่อ"
        const addContactBtn = screen.getByText('เพิ่มผู้ติดต่อ');
        fireEvent.click(addContactBtn);

        // Add point
        const addPointBtn = screen.getByText('เพิ่มจุดรับบริจาค');
        fireEvent.click(addPointBtn);

        expect(addContactBtn).toBeInTheDocument();
        expect(addPointBtn).toBeInTheDocument();
    });

    it('removes contact and point fields', async () => {
        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Add contact first to have 2 fields
        const addContactBtn = screen.getByText('เพิ่มผู้ติดต่อ');
        fireEvent.click(addContactBtn);

        const contactInputsBefore = screen.getAllByPlaceholderText('ชื่อ/รายละเอียด');
        expect(contactInputsBefore).toHaveLength(2);

        // Remove the second contact (index 1)
        const removeContactBtns = screen.getAllByTitle('ลบผู้ติดต่อ');
        fireEvent.click(removeContactBtns[0]);

        const contactInputsAfter = screen.getAllByPlaceholderText('ชื่อ/รายละเอียด');
        expect(contactInputsAfter).toHaveLength(1);

        // Add point first to have 2 fields
        const addPointBtn = screen.getByText('เพิ่มจุดรับบริจาค');
        fireEvent.click(addPointBtn);

        const pointInputsBefore = screen.getAllByPlaceholderText('ระบุสถานที่รับบริจาค...');
        expect(pointInputsBefore).toHaveLength(2);

        // Remove the second point (index 1)
        const removePointBtns = screen.getAllByTitle('ลบจุดรับบริจาค');
        fireEvent.click(removePointBtns[0]);

        const pointInputsAfter = screen.getAllByPlaceholderText('ระบุสถานที่รับบริจาค...');
        expect(pointInputsAfter).toHaveLength(1);
    });

    it('handles multiple bank accounts', async () => {
        const user = userEvent.setup();
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        id: 'new-id',
                    }),
                });
            }
            if (url === '/api/banks') return Promise.resolve({ ok: true, json: () => Promise.resolve([{ value: 'ktb', label: 'Krung Thai Bank' }]) });
            if (url === '/api/donations') return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        await user.click(screen.getByText('เพิ่มข้อมูล'));

        await waitFor(() => {
            expect(screen.getByText('เพิ่มบัญชีธนาคาร')).toBeInTheDocument();
        });

        // Fill name (required)
        await user.type(screen.getByPlaceholderText('เช่น สภากาชาดไทย...'), 'Test Bank Donation');

        // Add a second bank account
        await user.click(screen.getByText('เพิ่มบัญชีธนาคาร'));

        const bankSelects = screen.getAllByRole('combobox');
        // We expect at least 2 bank selects (one default, one added) + contact type select
        // Actually AdminSelect might not use native select, let's check implementation if needed.
        // But for now let's just check if we can fill inputs.

        const accountInputs = screen.getAllByPlaceholderText('xxx-x-xxxxx-x');
        expect(accountInputs).toHaveLength(2);

        await user.type(accountInputs[0], '1111');
        await user.type(accountInputs[1], '2222');

        await user.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/donations', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"accountNumber":"1111"')
            }));
            expect(global.fetch).toHaveBeenCalledWith('/api/donations', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"accountNumber":"2222"')
            }));
        });
    });

    it('handles multiple image uploads', async () => {
        const user = userEvent.setup();
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ id: 'new-id' }),
                });
            }
            if (url === '/api/banks') return Promise.resolve({ ok: true, json: async () => [] });
            // GET /api/donations should return an array
            if (url === '/api/donations') return Promise.resolve({ ok: true, json: async () => [] });
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        await user.click(screen.getByText('เพิ่มข้อมูล'));

        // Fill name (required)
        await user.type(screen.getByPlaceholderText('เช่น สภากาชาดไทย...'), 'Test Image Donation');

        await waitFor(() => {
            expect(screen.getByLabelText('รูปภาพ (Images)')).toBeInTheDocument();
        });

        const fileInput = screen.getByLabelText('รูปภาพ (Images)');
        const file1 = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });
        const file2 = new File(['(o_o)'], 'wow.png', { type: 'image/png' });

        await user.upload(fileInput, [file1, file2]);

        // Expect previews
        await waitFor(() => {
            expect(screen.getByAltText('Gallery Image 1')).toBeInTheDocument();
            expect(screen.getByAltText('Gallery Image 2')).toBeInTheDocument();
        });

        // Save
        await user.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/donations', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"images":[')
            }));
        });
    });

    it('filters empty fields on submission', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ ...mockDonations[0], id: '3', name: 'Filtered Donation' }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockDonations,
            });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        fireEvent.change(screen.getByPlaceholderText('เช่น สภากาชาดไทย...'), { target: { value: 'Filtered Donation' } });

        // First contact and point are empty by default

        // Add another contact and point and leave them empty
        fireEvent.click(screen.getByText('เพิ่มผู้ติดต่อ'));
        fireEvent.click(screen.getByText('เพิ่มจุดรับบริจาค'));

        // Submit
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/donations', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"contacts":[]') // Should be empty array or filtered
            }));
            expect(global.fetch).toHaveBeenCalledWith('/api/donations', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"donationPoints":[]') // Should be empty array or filtered
            }));
        });
    });

    it('handles API error on create', async () => {
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/donations' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: async () => ({}),
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockDonations,
            });
        });

        window.alert = jest.fn();

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));
        fireEvent.change(screen.getByPlaceholderText('เช่น สภากาชาดไทย...'), { target: { value: 'Error Donation' } });
        fireEvent.click(screen.getByText('บันทึกข้อมูล'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to save item: Unknown error');
        });
    });

    it('renders bank name as dropdown options from API', async () => {
        const mockBanks = [
            { value: 'Test Bank 1', label: 'Test Bank 1 (TB1)' },
            { value: 'Test Bank 2', label: 'Test Bank 2 (TB2)' },
        ];

        (global.fetch as unknown as jest.Mock).mockImplementation((url) => {
            if (url === '/api/banks') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockBanks,
                });
            }
            if (url === '/api/donations') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockDonations,
                });
            }
            return Promise.resolve({ ok: false });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Wait for banks to load
        await waitFor(() => {
            expect(screen.getByText('Test Bank 1 (TB1)')).toBeInTheDocument();
        });

        // Should find a select/combobox for bank
        const bankSelect = screen.getByLabelText('ธนาคาร');
        expect(bankSelect.tagName).toBe('SELECT');

        // Check for some options
        expect(screen.getByText('Test Bank 1 (TB1)')).toBeInTheDocument();
        expect(screen.getByText('Test Bank 2 (TB2)')).toBeInTheDocument();
    });

    it('renders contact type dropdown', async () => {
        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        // Should find contact type select (first one is default)
        const typeSelects = screen.getAllByLabelText(/ประเภท/);
        expect(typeSelects.length).toBeGreaterThan(0);
        expect(typeSelects[0].tagName).toBe('SELECT');

        // Check options
        expect(screen.getByText('เบอร์โทรศัพท์')).toBeInTheDocument();
        expect(screen.getByText('Line')).toBeInTheDocument();
        expect(screen.getByText('Facebook')).toBeInTheDocument();

        // Check for high contrast class
        expect(typeSelects[0]).toHaveClass('text-neutral-900');
    });

    it('renders bank name dropdown with high contrast text', async () => {
        const mockBanks = [{ value: 'Test Bank', label: 'Test Bank' }];
        (global.fetch as unknown as jest.Mock).mockImplementation((url) => {
            if (url === '/api/banks') return Promise.resolve({ ok: true, json: async () => mockBanks });
            if (url === '/api/donations') return Promise.resolve({ ok: true, json: async () => mockDonations });
            return Promise.resolve({ ok: false });
        });

        render(<DonationsAdminPage />);
        await waitFor(() => expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument());
        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        await waitFor(() => {
            const options = screen.getAllByText('Test Bank');
            expect(options.length).toBeGreaterThan(0);
        });

        const bankSelect = screen.getByLabelText('ธนาคาร');
        expect(bankSelect).toHaveClass('text-neutral-900');
    });

    it('handles fetch banks error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (global.fetch as unknown as jest.Mock).mockImplementation((url) => {
            if (url === '/api/banks') {
                return Promise.reject(new Error('Network error'));
            }
            if (url === '/api/donations') {
                return Promise.resolve({ ok: true, json: async () => [] });
            }
            return Promise.resolve({ ok: false });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch banks:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('handles edit donation with empty contacts and points', async () => {
        const mockDonationEmpty = {
            id: '1',
            name: 'Empty Donation',
            contacts: [],
            donationPoints: [],
            acceptsMoney: true,
        };

        (global.fetch as unknown as jest.Mock).mockImplementation((url) => {
            if (url === '/api/donations') {
                return Promise.resolve({
                    ok: true,
                    json: async () => [mockDonationEmpty],
                });
            }
            if (url === '/api/banks') {
                return Promise.resolve({ ok: true, json: async () => [] });
            }
            return Promise.resolve({ ok: false });
        });

        render(<DonationsAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        await waitFor(() => {
            expect(screen.getByDisplayValue('Empty Donation')).toBeInTheDocument();
            // Should have default empty contact and point fields added by transformEditData
            expect(screen.getAllByPlaceholderText('ชื่อ/รายละเอียด')).toHaveLength(1);
            expect(screen.getAllByPlaceholderText('ระบุสถานที่รับบริจาค...')).toHaveLength(1);
        });
    });



});

