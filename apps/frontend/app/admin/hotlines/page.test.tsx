import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HotlinesAdminPage from './page';

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

describe('HotlinesAdminPage', () => {
    const mockHotlines = [
        {
            id: '1',
            name: 'Test Hotline',
            numbers: ['02-123-4567'],
            category: 'General',
            description: 'Test Description',
            color: 'bg-blue-500',
            isPopular: false,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as unknown as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHotlines,
        });
    });

    it('renders hotlines list', async () => {
        render(<HotlinesAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Hotline')).toBeInTheDocument();
            expect(screen.getByText('02-123-4567')).toBeInTheDocument();
        });
    });

    it('opens modal when clicking add button', async () => {
        render(<HotlinesAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('เพิ่มข้อมูลใหม่')).toBeInTheDocument();
    });

    it('opens modal with data when clicking edit button', async () => {
        render(<HotlinesAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('แก้ไขข้อมูล')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Hotline')).toBeInTheDocument();
    });

    it('handles delete', async () => {
        // Mock confirm
        window.confirm = jest.fn(() => true);
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/hotlines') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockHotlines,
                });
            }
            if (url === '/api/hotlines/1' && options?.method === 'DELETE') {
                return Promise.resolve({ ok: true });
            }
            return Promise.resolve({ ok: false });
        });

        render(<HotlinesAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('ลบ')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('ลบ'));

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/hotlines/1', expect.objectContaining({ method: 'DELETE' }));
        });
    });
});
