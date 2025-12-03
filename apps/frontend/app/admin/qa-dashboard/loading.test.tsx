import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './loading';

// Mock LoadingSpinner
jest.mock('@/components/ui/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('QA Dashboard Loading', () => {
    it('renders loading spinner', () => {
        render(<Loading />);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
});
