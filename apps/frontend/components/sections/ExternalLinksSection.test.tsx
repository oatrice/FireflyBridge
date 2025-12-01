import { render, screen, fireEvent } from '@testing-library/react';
import ExternalLinksSection from './ExternalLinksSection';
import { ExternalLink } from '@/lib/types';

const mockLinks: ExternalLink[] = Array.from({ length: 8 }, (_, i) => ({
    id: `link-${i}`,
    name: `Link ${i + 1}`,
    description: `Description ${i + 1}`,
    url: `https://example.com/${i}`,
    icon: '🔗',
    category: 'general'
}));

describe('ExternalLinksSection', () => {
    it('renders loading state correctly', () => {
        render(<ExternalLinksSection externalLinks={[]} loading={true} />);

        // Should show skeleton loaders
        const skeletons = document.getElementsByClassName('animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders initial 6 links when loaded', () => {
        render(<ExternalLinksSection externalLinks={mockLinks} loading={false} />);

        // Should show only first 6 links
        expect(screen.getByText('Link 1')).toBeInTheDocument();
        expect(screen.getByText('Link 6')).toBeInTheDocument();
        expect(screen.queryByText('Link 7')).not.toBeInTheDocument();
    });

    it('toggles show all links', () => {
        // Mock scrollIntoView
        window.HTMLElement.prototype.scrollIntoView = jest.fn();

        render(<ExternalLinksSection externalLinks={mockLinks} loading={false} />);

        const toggleButton = screen.getByText('ดูทั้งหมด');

        // Click to show all
        fireEvent.click(toggleButton);
        expect(screen.getByText('Link 7')).toBeInTheDocument();
        expect(screen.getByText('ย่อรายการ')).toBeInTheDocument();

        // Click to collapse
        fireEvent.click(screen.getByText('ย่อรายการ'));
        expect(screen.queryByText('Link 7')).not.toBeInTheDocument();
        expect(screen.getByText('ดูทั้งหมด')).toBeInTheDocument();
    });

    it('does not show toggle button if links <= 6', () => {
        const fewLinks = mockLinks.slice(0, 5);
        render(<ExternalLinksSection externalLinks={fewLinks} loading={false} />);

        expect(screen.queryByText('ดูทั้งหมด')).not.toBeInTheDocument();
    });
});
