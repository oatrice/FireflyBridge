import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPage from './page';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

// Mock auth-client
jest.mock('@/lib/auth-client', () => ({
    authClient: {
        getSession: jest.fn(),
        signOut: jest.fn(),
    },
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
) as unknown as typeof fetch;

describe('AdminPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    it('redirects to login if no session', async () => {
        (authClient.getSession as jest.Mock).mockResolvedValue({ data: null });

        render(<AdminPage />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('shows access denied if user is not admin', async () => {
        (authClient.getSession as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    name: 'User',
                    email: 'user@example.com',
                    role: 'user',
                },
            },
        });

        render(<AdminPage />);

        await waitFor(() => {
            expect(screen.getByText('Access Denied')).toBeInTheDocument();
        });
    });

    it('renders dashboard if user is admin', async () => {
        (authClient.getSession as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    name: 'Admin',
                    email: 'admin@example.com',
                    role: 'admin',
                },
            },
        });

        render(<AdminPage />);

        await waitFor(() => {
            expect(screen.getByText('ภาพรวม (Overview)')).toBeInTheDocument();
            expect(screen.getByText('ยินดีต้อนรับ, Admin')).toBeInTheDocument();
        });
    });

    it('handles sign out', async () => {
        (authClient.getSession as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    name: 'Admin',
                    email: 'admin@example.com',
                    role: 'admin',
                },
            },
        });

        render(<AdminPage />);

        await waitFor(() => {
            const signOutButtons = screen.getAllByText('ออกจากระบบ');
            expect(signOutButtons.length).toBeGreaterThan(0);
        });

        const signOutButton = screen.getAllByText('ออกจากระบบ')[0];
        fireEvent.click(signOutButton);

        await waitFor(() => {
            expect(authClient.signOut).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });
});
