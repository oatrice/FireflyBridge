import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from './page';

// Mock child components
jest.mock('@/components/ui/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('@/components/ui/NavigationBar', () => () => <div data-testid="nav-bar">NavBar</div>);
jest.mock('@/components/sections/SheltersSection', () => () => <div data-testid="shelters-section">Shelters</div>);
jest.mock('@/components/sections/DonationsSection', () => () => <div data-testid="donations-section">Donations</div>);
jest.mock('@/components/sections/ExternalLinksSection', () => () => <div data-testid="external-links-section">ExternalLinks</div>);
jest.mock('@/components/sections/HotlinesSection', () => () => <div data-testid="hotlines-section">Hotlines</div>);
jest.mock('@/components/ui/DeployInfo', () => () => <div data-testid="deploy-info">DeployInfo</div>);
jest.mock('@/components/ui/Footer', () => () => <div data-testid="footer">Footer</div>);

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
) as unknown as typeof fetch;

describe('Home Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all main sections', async () => {
        render(<Home />);

        // Wait for dynamic components to load
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar')).toBeInTheDocument();
            expect(screen.getByTestId('shelters-section')).toBeInTheDocument();
            expect(screen.getByTestId('donations-section')).toBeInTheDocument();
            expect(screen.getByTestId('external-links-section')).toBeInTheDocument();
            expect(screen.getByTestId('hotlines-section')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
        });
    });

    it('fetches initial data on mount', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(4);
            expect(global.fetch).toHaveBeenCalledWith('/api/hotlines');
            expect(global.fetch).toHaveBeenCalledWith('/api/external-links');
            expect(global.fetch).toHaveBeenCalledWith('/api/shelters');
            expect(global.fetch).toHaveBeenCalledWith('/api/donations');
        });
    });

    it('handles scroll event for feedback button', () => {
        render(<Home />);

        const feedbackButton = screen.getByText('แจ้งข้อมูล / ข้อเสนอแนะ').closest('a');
        expect(feedbackButton).toHaveClass('px-6'); // Initial state

        // Mock window.scrollY
        Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
        fireEvent.scroll(window);

        // Check if class changed
        waitFor(() => {
            expect(feedbackButton).toHaveClass('px-3');
        });
    });

    it('handles fetch errors gracefully', async () => {
        // Mock fetch error (reject)
        (global.fetch as unknown as jest.Mock).mockImplementationOnce(() => Promise.reject('API Error'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Home />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching data:', 'API Error');
        });

        consoleSpy.mockRestore();
    });

    it('handles non-ok API responses', async () => {
        // Mock fetch returning ok: false
        (global.fetch as unknown as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve([]),
            })
        );

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Home />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });
});
