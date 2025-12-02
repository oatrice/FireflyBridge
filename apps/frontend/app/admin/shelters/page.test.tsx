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
});
