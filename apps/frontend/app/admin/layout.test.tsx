import { render, screen } from '@testing-library/react';
import AdminLayout from './layout';

// Mock AdminSidebar
jest.mock('@/components/admin/AdminSidebar', () => {
    return function MockAdminSidebar() {
        return <div data-testid="admin-sidebar">Admin Sidebar</div>;
    };
});

describe('AdminLayout', () => {
    it('renders children and sidebar', () => {
        render(
            <AdminLayout>
                <div data-testid="child-content">Child Content</div>
            </AdminLayout>
        );

        expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
});
