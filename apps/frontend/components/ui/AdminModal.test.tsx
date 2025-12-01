import { render, screen, fireEvent } from '@testing-library/react';
import { AdminModal } from './AdminModal';

describe('AdminModal', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    it('does not render when isOpen is false', () => {
        render(
            <AdminModal isOpen={false} onClose={mockOnClose} title="Test Modal">
                <div>Modal Content</div>
            </AdminModal>
        );

        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
        expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders correctly when isOpen is true', () => {
        render(
            <AdminModal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <div>Modal Content</div>
            </AdminModal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('applies custom maxWidth class', () => {
        const { container } = render(
            <AdminModal isOpen={true} onClose={mockOnClose} title="Test Modal" maxWidth="max-w-xl">
                <div>Content</div>
            </AdminModal>
        );

        // Find the inner div that has the max-w class
        // The structure is: fixed overlay > relative container
        const modalContainer = container.querySelector('.max-w-xl');
        expect(modalContainer).toBeInTheDocument();
    });
});
