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
    it('handles email login submission', async () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText('Email'));

        fireEvent.change(screen.getByPlaceholderText('Email address'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(authClient.signIn.email).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                callbackURL: '/admin',
            }, expect.any(Object));
        });
    });

    it('handles email registration flow', async () => {
        // Mock successful signup and OTP send
        (authClient.signUp.email as jest.Mock).mockImplementation((data, options) => {
            options.onSuccess();
            return Promise.resolve();
        });

        render(<LoginPage />);

        // Switch to Sign Up
        fireEvent.click(screen.getByText("Don't have an account? Sign up"));

        // Switch to Email
        fireEvent.click(screen.getByText('Email'));

        fireEvent.change(screen.getByPlaceholderText('Full Name'), {
            target: { value: 'Test User' },
        });
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
            target: { value: 'new@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('Sign Up'));

        await waitFor(() => {
            expect(authClient.signUp.email).toHaveBeenCalled();
            expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalled();
            expect(screen.getByRole('heading', { name: 'Verify OTP' })).toBeInTheDocument();
        });

        // Verify OTP
        fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
            target: { value: '123456' },
        });

        // Mock successful verification
        (authClient.emailOtp.verifyEmail as jest.Mock).mockImplementation((data, options) => {
            options.onSuccess();
            return Promise.resolve();
        });

        // Mock window.alert
        window.alert = jest.fn();

        fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));

        await waitFor(() => {
            expect(authClient.emailOtp.verifyEmail).toHaveBeenCalledWith({
                email: 'new@example.com',
                otp: '123456',
            }, expect.any(Object));
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('verified successfully'));
            expect(screen.getByText('Admin Login')).toBeInTheDocument();
        });
    });

    it('handles phone registration flow', async () => {
        // Mock successful OTP send
        (authClient.phoneNumber.sendOtp as jest.Mock).mockImplementation((data, options) => {
            options.onSuccess();
            return Promise.resolve();
        });

        render(<LoginPage />);

        // Switch to Sign Up
        fireEvent.click(screen.getByText("Don't have an account? Sign up"));

        // Default is Phone

        fireEvent.change(screen.getByPlaceholderText('Phone Number (e.g. +66...)'), {
            target: { value: '+66812345678' },
        });

        fireEvent.click(screen.getByText('Send OTP'));

        await waitFor(() => {
            expect(authClient.phoneNumber.sendOtp).toHaveBeenCalled();
            expect(screen.getByRole('heading', { name: 'Verify OTP' })).toBeInTheDocument();
        });

        // Verify OTP
        fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
            target: { value: '123456' },
        });

        // Mock successful verification
        (authClient.phoneNumber.verify as jest.Mock).mockImplementation((data, options) => {
            options.onSuccess();
            return Promise.resolve();
        });

        // Mock window.alert
        window.alert = jest.fn();

        fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));

        await waitFor(() => {
            expect(authClient.phoneNumber.verify).toHaveBeenCalledWith({
                phoneNumber: '+66812345678',
                code: '123456',
            }, expect.any(Object));
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('verified successfully'));
            expect(mockPush).toHaveBeenCalledWith('/admin');
        });
    });

    it('handles login error', async () => {
        // Mock login error
        (authClient.signIn.email as jest.Mock).mockImplementation((data, options) => {
            options.onError({ error: { message: 'Invalid credentials' } });
            return Promise.resolve();
        });

        window.alert = jest.fn();

        render(<LoginPage />);

        fireEvent.click(screen.getByText('Email'));
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
        });
    });

    it('handles registration error', async () => {
        (authClient.signUp.email as jest.Mock).mockImplementation((data, options) => {
            options.onError({ error: { message: 'Email already exists' } });
            return Promise.resolve();
        });

        window.alert = jest.fn();

        render(<LoginPage />);

        fireEvent.click(screen.getByText("Don't have an account? Sign up"));
        fireEvent.click(screen.getByText('Email'));

        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByText('Sign Up'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Email already exists');
        });
    });

    it('handles OTP verification error', async () => {
        // Mock successful signup to get to OTP screen
        (authClient.signUp.email as jest.Mock).mockImplementation((data, options) => {
            options.onSuccess();
            return Promise.resolve();
        });

        render(<LoginPage />);

        fireEvent.click(screen.getByText("Don't have an account? Sign up"));
        fireEvent.click(screen.getByText('Email'));

        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByText('Sign Up'));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Verify OTP' })).toBeInTheDocument();
        });

        // Mock OTP error
        (authClient.emailOtp.verifyEmail as jest.Mock).mockImplementation((data, options) => {
            options.onError({ error: { message: 'Invalid OTP' } });
            return Promise.resolve();
        });

        window.alert = jest.fn();

        fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '000000' } });
        fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Invalid OTP');
        });
    });
});
