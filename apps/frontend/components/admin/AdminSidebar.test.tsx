import { render, screen } from '@testing-library/react';
import AdminSidebar from './AdminSidebar';
import { usePathname } from 'next/navigation';

// Mock usePathname
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

describe('AdminSidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all menu items', () => {
        (usePathname as jest.Mock).mockReturnValue('/admin');
        render(<AdminSidebar />);

        expect(screen.getByText('ภาพรวม (Overview)')).toBeInTheDocument();
        expect(screen.getByText('เบอร์โทรฉุกเฉิน (Hotlines)')).toBeInTheDocument();
        expect(screen.getByText('ศูนย์พักพิง (Shelters)')).toBeInTheDocument();
        expect(screen.getByText('การบริจาค (Donations)')).toBeInTheDocument();
        expect(screen.getByText('ลิงก์ภายนอก (External Links)')).toBeInTheDocument();
    });

    it('highlights the active menu item', () => {
        (usePathname as jest.Mock).mockReturnValue('/admin/hotlines');
        render(<AdminSidebar />);

        const activeLink = screen.getByText('เบอร์โทรฉุกเฉิน (Hotlines)').closest('a');
        expect(activeLink).toHaveClass('bg-blue-50', 'text-blue-600');

        const inactiveLink = screen.getByText('ภาพรวม (Overview)').closest('a');
        expect(inactiveLink).not.toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('renders the back to home link', () => {
        (usePathname as jest.Mock).mockReturnValue('/admin');
        render(<AdminSidebar />);

        expect(screen.getByText('กลับหน้าหลัก')).toBeInTheDocument();
    });
});
