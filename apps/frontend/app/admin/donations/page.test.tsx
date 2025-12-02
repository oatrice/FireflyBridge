import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
            qrCodeUrl: 'https://example.com/qr.png',
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
});
