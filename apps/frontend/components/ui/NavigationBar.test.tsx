import { render, screen } from '@testing-library/react';
import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
    it('renders all navigation links', () => {
        render(<NavigationBar />);

        const links = [
            { text: 'ศูนย์พักพิง', href: '#shelters', icon: '🏠' },
            { text: 'รับบริจาค', href: '#donations', icon: '❤️' },
            { text: 'แพลตฟอร์ม', href: '#external', icon: '🔗' },
            { text: 'เบอร์ฉุกเฉิน', href: '#hotlines', icon: '📞' },
        ];

        links.forEach(link => {
            const anchor = screen.getByText(link.text).closest('a');
            expect(anchor).toBeInTheDocument();
            expect(anchor).toHaveAttribute('href', link.href);
            expect(screen.getByText(link.icon)).toBeInTheDocument();
        });
    });

    it('has correct styling classes', () => {
        render(<NavigationBar />);

        const nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('sticky', 'top-0', 'z-40');
    });
});
