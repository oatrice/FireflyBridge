import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageCarousel } from './ImageCarousel';

describe('ImageCarousel', () => {
    const mockImages = [
        '/image1.jpg',
        '/image2.jpg',
        '/image3.jpg'
    ];
    const mockAlt = 'Test Image';

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders nothing if no images provided', () => {
        const { container } = render(<ImageCarousel images={[]} alt={mockAlt} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders first image initially', () => {
        render(<ImageCarousel images={mockImages} alt={mockAlt} />);
        const images = screen.getAllByRole('img');
        // We expect multiple images because we render them all in a flex container now
        expect(images).toHaveLength(mockImages.length);
        expect(images[0]).toHaveAttribute('alt', `${mockAlt} - Image 1`);
        expect(images[0]).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
    });

    it('advances to next slide automatically', () => {
        render(<ImageCarousel images={mockImages} alt={mockAlt} interval={1000} />);

        // Initial state: translate-x-0 (0%)
        const container = screen.getByText((content, element) => {
            return element?.className.includes('transition-transform') ?? false;
        });
        expect(container).toHaveStyle({ transform: 'translateX(-0%)' });

        // Advance time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Should be at second slide: translateX(-100%)
        expect(container).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('pauses auto-play on hover', () => {
        render(<ImageCarousel images={mockImages} alt={mockAlt} interval={1000} />);

        const wrapper = screen.getByRole('img', { name: `${mockAlt} - Image 1` }).closest('.group');

        // Mouse enter
        fireEvent.mouseEnter(wrapper!);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Should still be at first slide
        const container = screen.getByText((content, element) => {
            return element?.className.includes('transition-transform') ?? false;
        });
        expect(container).toHaveStyle({ transform: 'translateX(-0%)' });

        // Mouse leave
        fireEvent.mouseLeave(wrapper!);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Should advance
        expect(container).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('navigates with buttons', () => {
        render(<ImageCarousel images={mockImages} alt={mockAlt} autoPlay={false} />);

        const nextBtn = screen.getByLabelText('Next image');
        const prevBtn = screen.getByLabelText('Previous image');
        const container = screen.getByText((content, element) => {
            return element?.className.includes('transition-transform') ?? false;
        });

        // Next
        fireEvent.click(nextBtn);
        expect(container).toHaveStyle({ transform: 'translateX(-100%)' });

        // Prev (back to 0)
        fireEvent.click(prevBtn);
        expect(container).toHaveStyle({ transform: 'translateX(-0%)' });

        // Prev (wrap around to last)
        fireEvent.click(prevBtn);
        expect(container).toHaveStyle({ transform: 'translateX(-200%)' });
    });

    it('navigates with dots', () => {
        render(<ImageCarousel images={mockImages} alt={mockAlt} autoPlay={false} />);

        const dots = screen.getAllByLabelText(/Go to image/);
        const container = screen.getByText((content, element) => {
            return element?.className.includes('transition-transform') ?? false;
        });

        fireEvent.click(dots[2]);
        expect(container).toHaveStyle({ transform: 'translateX(-200%)' });
    });

    it('opens modal on click', () => {
        render(<ImageCarousel images={mockImages} alt={mockAlt} />);

        const imageContainer = screen.getByRole('img', { name: `${mockAlt} - Image 1` }).closest('.cursor-pointer');
        fireEvent.click(imageContainer!);

        expect(screen.getByText('×')).toBeInTheDocument();
        // Modal image should be present
        expect(screen.getByAltText(`${mockAlt} - Fullscreen 1`)).toBeInTheDocument();
    });
});
