import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

// Mock auth-client
jest.mock('@/lib/auth-client', () => ({
    authClient: {
        signIn: {
            social: jest.fn(),
            email: jest.fn(),
            phoneNumber: jest.fn(),
        },
        signUp: {
            email: jest.fn(),
        },
        emailOtp: {
            sendVerificationOtp: jest.fn(),
            verifyEmail: jest.fn(),
        },
        phoneNumber: {
            sendOtp: jest.fn(),
            verify: jest.fn(),
        },
    },
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('LoginPage', () => {
    const mockPush = jest.fn();
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        process.env = { ...originalEnv, NEXT_PUBLIC_ENABLE_AUTH: 'true' };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('renders coming soon when auth is disabled', () => {
        process.env.NEXT_PUBLIC_ENABLE_AUTH = 'false';
        render(<LoginPage />);
        expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
    });

    it('renders login form when auth is enabled', () => {
        render(<LoginPage />);
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Phone Number (e.g. +66...)')).toBeInTheDocument();
    });

    it('switches between phone and email login', () => {
        render(<LoginPage />);

        // Default is phone
        expect(screen.getByPlaceholderText('Phone Number (e.g. +66...)')).toBeInTheDocument();

        // Switch to email
        fireEvent.click(screen.getByText('Email'));
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('handles social login', async () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText('Google'));

        await waitFor(() => {
            expect(authClient.signIn.social).toHaveBeenCalledWith({
                provider: 'google',
                callbackURL: '/admin',
            });
        });
    });

    it('handles phone login submission', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('Phone Number (e.g. +66...)'), {
            target: { value: '+66812345678' },
        });

        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(authClient.signIn.phoneNumber).toHaveBeenCalled();
        });
    });

    it('toggles between sign in and sign up', () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText("Don't have an account? Sign up"));
        expect(screen.getByText('Create Account')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Already have an account? Sign in'));
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });
});
