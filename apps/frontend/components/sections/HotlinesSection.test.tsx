import { render, screen, fireEvent } from '@testing-library/react'
import HotlinesSection from './HotlinesSection'

const mockHotlines = [
    {
        id: '1',
        name: 'Emergency 1',
        number: '111',
        category: 'ยอดฮิต',
        description: 'Emergency service 1',
        color: 'bg-red-500'
    },
    {
        id: '2',
        name: 'Foundation A',
        numbers: ['222', '333'],
        category: 'มูลนิธิ',
        description: 'Foundation help',
        color: 'bg-blue-500',
        links: { facebook: 'https://fb.com/foundation' }
    },
    {
        id: '3',
        name: 'Volunteer B',
        number: '444',
        category: 'อาสาสมัคร',
        description: 'Volunteer group',
        color: 'bg-green-500'
    },
    // Add more items to test pagination (need > 6 items)
    { id: '4', name: 'H4', number: '4', category: 'ยอดฮิต', description: 'D4', color: 'c' },
    { id: '5', name: 'H5', number: '5', category: 'ยอดฮิต', description: 'D5', color: 'c' },
    { id: '6', name: 'H6', number: '6', category: 'ยอดฮิต', description: 'D6', color: 'c' },
    { id: '7', name: 'H7', number: '7', category: 'ยอดฮิต', description: 'D7', color: 'c' },
]

describe('HotlinesSection', () => {
    it('renders loading state correctly', () => {
        render(<HotlinesSection hotlines={[]} loading={true} />)
        // Check for pulse animation class or structure
        const skeletons = screen.getAllByRole('generic').filter(e => e.className.includes('animate-pulse'))
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders hotlines and title correctly', async () => {
        render(<HotlinesSection hotlines={mockHotlines} loading={false} />)
        expect(screen.getByText(/เบอร์โทรฉุกเฉิน/)).toBeInTheDocument()
        expect(await screen.findByText('Emergency 1')).toBeInTheDocument()
    })

    it('filters by search term', () => {
        render(<HotlinesSection hotlines={mockHotlines} loading={false} />)

        // Switch to "ทั้งหมด" first to search across all categories
        const allBtn = screen.getByRole('button', { name: 'ทั้งหมด' })
        fireEvent.click(allBtn)

        const searchInput = screen.getByPlaceholderText(/ค้นหาเบอร์โทร/i)
        fireEvent.change(searchInput, { target: { value: 'Foundation' } })

        expect(screen.getByText('Foundation A')).toBeInTheDocument()
        expect(screen.queryByText('Emergency 1')).not.toBeInTheDocument()
    })

    it('filters by category', () => {
        render(<HotlinesSection hotlines={mockHotlines} loading={false} />)

        // Switch to "มูลนิธิ"
        const foundationBtn = screen.getByRole('button', { name: 'มูลนิธิ' })
        fireEvent.click(foundationBtn)

        expect(screen.getByText('Foundation A')).toBeInTheDocument()
        expect(screen.queryByText('Emergency 1')).not.toBeInTheDocument()

        // Switch back to "ทั้งหมด" (or "ยอดฮิต" if default logic applies, but UI has "ทั้งหมด" button usually or we check logic)
        // The component logic: const priorityCategories = ["ทั้งหมด", "ยอดฮิต", ...];
        // Initial state is "ยอดฮิต".
        // Let's click "ทั้งหมด"
        const allBtn = screen.getByRole('button', { name: 'ทั้งหมด' })
        fireEvent.click(allBtn)

        expect(screen.getByText('Emergency 1')).toBeInTheDocument()
        expect(screen.getByText('Foundation A')).toBeInTheDocument()
    })

    it('handles pagination', () => {
        render(<HotlinesSection hotlines={mockHotlines} loading={false} />)

        // Initial state: "ยอดฮิต" selected by default.
        // mockHotlines has 5 items with "ยอดฮิต" (1, 4, 5, 6, 7).
        // Page size is 6. So all 5 should be visible.
        // Wait, let's switch to "ทั้งหมด" to ensure we have > 6 items.
        // Total items: 7.

        const allBtn = screen.getByRole('button', { name: 'ทั้งหมด' })
        fireEvent.click(allBtn)

        // Page 1 should show 6 items. Item 7 (H7) should be on page 2.
        // Items 1-6 should be visible.
        expect(screen.getByText('Emergency 1')).toBeInTheDocument()
        expect(screen.getByText('H6')).toBeInTheDocument()
        expect(screen.queryByText('H7')).not.toBeInTheDocument()

        // Go to next page
        const nextBtn = screen.getByRole('button', { name: /ถัดไป/i })
        fireEvent.click(nextBtn)

        expect(screen.getByText('H7')).toBeInTheDocument()
        expect(screen.queryByText('Emergency 1')).not.toBeInTheDocument()
    })

    it('clears search from no results state', () => {
        render(<HotlinesSection hotlines={mockHotlines} loading={false} />)

        const searchInput = screen.getByPlaceholderText(/ค้นหาเบอร์โทร/i)
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

        expect(screen.getByText(/ไม่พบข้อมูล/)).toBeInTheDocument()

        const clearBtn = screen.getByRole('button', { name: 'ล้างการค้นหา' })
        fireEvent.click(clearBtn)

        expect(screen.queryByText(/ไม่พบข้อมูล/)).not.toBeInTheDocument()
        expect(screen.getByText('Emergency 1')).toBeInTheDocument()
    })

    it('sorts popular hotlines by displayOrder', () => {
        // Mock data with displayOrder and required fields
        const popularHotlines = [
            {
                id: '1',
                name: 'B Hotline',
                category: 'ยอดฮิต',
                description: 'B desc',
                color: 'bg-red-500',
                isPopular: true,
                displayOrder: 2
            },
            {
                id: '2',
                name: 'A Hotline',
                category: 'ยอดฮิต',
                description: 'A desc',
                color: 'bg-red-500',
                isPopular: true,
                displayOrder: 1
            },
        ]
        render(<HotlinesSection hotlines={popularHotlines} loading={false} />)

        // Default category is "ยอดฮิต", should be sorted by displayOrder
        // A should come before B (displayOrder 1 < 2)
        const names = screen.getAllByText(/^[AB] Hotline$/)
        expect(names[0]).toHaveTextContent('A Hotline')
        expect(names[1]).toHaveTextContent('B Hotline')
    })

    it('disables pagination buttons correctly', () => {
        render(<HotlinesSection hotlines={mockHotlines} loading={false} />)

        // Switch to "ทั้งหมด" to have multiple pages
        const allBtn = screen.getByRole('button', { name: 'ทั้งหมด' })
        fireEvent.click(allBtn)

        // Page 1: Previous disabled, Next enabled
        const prevBtn = screen.getByRole('button', { name: /ก่อนหน้า/i })
        const nextBtn = screen.getByRole('button', { name: /ถัดไป/i })

        expect(prevBtn).toBeDisabled()
        expect(nextBtn).toBeEnabled()

        // Go to Page 2 (Last page)
        fireEvent.click(nextBtn)

        expect(prevBtn).toBeEnabled()
        expect(nextBtn).toBeDisabled()
    })
})
