import { render, screen, fireEvent } from '@testing-library/react'
import SheltersSection from './SheltersSection'

const mockShelters = [
    {
        id: '1',
        name: 'Shelter A',
        location: 'Location A',
        area: 'Area 1',
        status: 'Open',
        contacts: [{ name: 'Contact A', phone: '0812345678' }],
        icon: '🏠'
    },
    {
        id: '2',
        name: 'Shelter B',
        location: 'Location B',
        area: 'Area 2',
        status: 'Full',
        contacts: [{ name: 'Contact B', phone: '0898765432' }],
        icon: '🏫'
    },
    // Add more for pagination
    { id: '3', name: 'S3', location: 'L3', area: 'Area 1', status: 'Open', contacts: [], icon: 'x' },
    { id: '4', name: 'S4', location: 'L4', area: 'Area 1', status: 'Open', contacts: [], icon: 'x' },
    { id: '5', name: 'S5', location: 'L5', area: 'Area 1', status: 'Open', contacts: [], icon: 'x' },
    { id: '6', name: 'S6', location: 'L6', area: 'Area 1', status: 'Open', contacts: [], icon: 'x' },
    { id: '7', name: 'S7', location: 'L7', area: 'Area 1', status: 'Open', contacts: [], icon: 'x' },
]

describe('SheltersSection', () => {
    it('renders loading state', () => {
        render(<SheltersSection shelters={[]} loading={true} />)
        expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument()
    })

    it('renders shelters correctly', () => {
        render(<SheltersSection shelters={mockShelters} loading={false} />)
        expect(screen.getByText('Shelter A')).toBeInTheDocument()
    })

    it('filters by search term', () => {
        render(<SheltersSection shelters={mockShelters} loading={false} />)

        const searchInput = screen.getByPlaceholderText(/ค้นหาศูนย์พักพิง/i)
        fireEvent.change(searchInput, { target: { value: 'Location A' } })

        expect(screen.getByText('Shelter A')).toBeInTheDocument()
        expect(screen.queryByText('Shelter B')).not.toBeInTheDocument()
    })

    it('filters by area', async () => {
        render(<SheltersSection shelters={mockShelters} loading={false} />)

        const areaBtn = screen.getByRole('button', { name: /Area 2/i })
        fireEvent.click(areaBtn)

        expect(await screen.findByText('Shelter B')).toBeInTheDocument()
        expect(screen.queryByText('Shelter A')).not.toBeInTheDocument()
    })

    it('toggles view mode', () => {
        render(<SheltersSection shelters={mockShelters} loading={false} />)

        // Default is Grid
        expect(screen.getByTitle('Grid View')).toHaveClass('bg-blue-600')

        // Switch to List
        const listBtn = screen.getByTitle('List View')
        fireEvent.click(listBtn)

        expect(screen.getByTitle('List View')).toHaveClass('bg-blue-600')
        // List view specific structure check (e.g., different class or layout)
        // In this component, list view items have "flex items-center justify-between gap-4"
        // But simpler is to check if the button state changed and items are still there
        expect(screen.getByText('Shelter A')).toBeInTheDocument()
    })

    it('handles pagination', () => {
        render(<SheltersSection shelters={mockShelters} loading={false} />)

        // Sorted by Area (default):
        // Page 1: A, S3, S4, S5, S6, S7 (All Area 1)
        // Page 2: B (Area 2)

        expect(screen.getByText('Shelter A')).toBeInTheDocument()
        expect(screen.getByText('S7')).toBeInTheDocument()
        expect(screen.queryByText('Shelter B')).not.toBeInTheDocument()

        const nextBtn = screen.getByRole('button', { name: /ถัดไป/i })
        fireEvent.click(nextBtn)

        expect(screen.getByText('Shelter B')).toBeInTheDocument()
        expect(screen.queryByText('Shelter A')).not.toBeInTheDocument()
    })
})
