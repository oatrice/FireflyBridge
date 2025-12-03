import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders correctly with default props', () => {
        const { container } = render(<LoadingSpinner />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('border-blue-600'); // Default color

        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('min-h-[60vh]'); // Default className
    });

    it('applies custom color', () => {
        const { container } = render(<LoadingSpinner color="border-red-500" />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('border-red-500');
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="h-full" />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('h-full');
        expect(wrapper).not.toHaveClass('min-h-[60vh]');
    });
});
