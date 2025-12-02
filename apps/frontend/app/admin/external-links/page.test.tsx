import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExternalLinksAdminPage from './page';

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

describe('ExternalLinksAdminPage', () => {
    const mockLinks = [
        {
            id: '1',
            name: 'Test Link',
            url: 'https://example.com',
            description: 'Test Description',
            category: 'General',
            icon: '🔗',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as unknown as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockLinks,
        });
    });

    it('renders external links list', async () => {
        render(<ExternalLinksAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Link')).toBeInTheDocument();
            expect(screen.getByText('https://example.com')).toBeInTheDocument();
        });
    });

    it('opens modal when clicking add button', async () => {
        render(<ExternalLinksAdminPage />);

        await waitFor(() => {
            expect(screen.getByText('เพิ่มข้อมูล')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('เพิ่มข้อมูล'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('เพิ่มข้อมูลใหม่')).toBeInTheDocument();
    });

    it('opens modal with data when clicking edit button', async () => {
        render(<ExternalLinksAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('แก้ไข')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('แก้ไข'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('แก้ไขข้อมูล')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Link')).toBeInTheDocument();
    });

    it('handles delete', async () => {
        // Mock confirm
        window.confirm = jest.fn(() => true);
        (global.fetch as unknown as jest.Mock).mockImplementation((url, options) => {
            if (url === '/api/external-links') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockLinks,
                });
            }
            if (url === '/api/external-links/1' && options?.method === 'DELETE') {
                return Promise.resolve({ ok: true });
            }
            return Promise.resolve({ ok: false });
        });

        render(<ExternalLinksAdminPage />);

        await waitFor(() => {
            expect(screen.getByTitle('ลบ')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('ลบ'));

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/external-links/1', expect.objectContaining({ method: 'DELETE' }));
        });
    });
});
