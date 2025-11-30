import { render, screen, fireEvent } from '@testing-library/react'
import DonationsSection from './DonationsSection'

const mockDonations = [
    {
        id: '1',
        name: 'A Hospital',
        bankName: 'KBANK',
        accountNumber: '123-4-56789-0',
        accountName: 'Hospital A Account',
        description: 'Medical supplies',
        acceptsMoney: true
    },
    {
        id: '2',
        name: 'B Foundation',
        bankName: 'SCB',
        accountNumber: '987-6-54321-0',
        accountName: 'Foundation B Account',
        description: 'Food and water',
        acceptsMoney: true
    },
    // Add more items to test "Show More"
    { id: '3', name: 'C Donation', bankName: 'BBL', accountNumber: '3', accountName: 'N3' },
    { id: '4', name: 'D Donation', bankName: 'KTB', accountNumber: '4', accountName: 'N4' },
    { id: '5', name: 'E Donation', bankName: 'BAY', accountNumber: '5', accountName: 'N5' },
    { id: '6', name: 'F Donation', bankName: 'GSB', accountNumber: '6', accountName: 'N6' },
    { id: '7', name: 'Z Donation', bankName: 'BAAC', accountNumber: '7', accountName: 'N7' },
]

describe('DonationsSection', () => {
    beforeAll(() => {
        // Mock scrollIntoView
        window.HTMLElement.prototype.scrollIntoView = jest.fn()
    })

    it('renders loading state', () => {
        render(<DonationsSection donations={[]} loading={true} />)
        expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument()
    })

    it('renders donations correctly', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)
        expect(screen.getByText('A Hospital')).toBeInTheDocument()
        expect(screen.getByText('B Foundation')).toBeInTheDocument()
    })

    it('filters by search term', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        const searchInput = screen.getByPlaceholderText(/ค้นหาช่องทางบริจาค/i)
        fireEvent.change(searchInput, { target: { value: 'Hospital' } })

        expect(screen.getByText('A Hospital')).toBeInTheDocument()
        expect(screen.queryByText('B Foundation')).not.toBeInTheDocument()
    })

    it('handles show more/less', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        // Initial state: show 6 items (A-F)
        expect(screen.getByText('A Hospital')).toBeInTheDocument()
        expect(screen.queryByText('Z Donation')).not.toBeInTheDocument()

        const showMoreBtn = screen.getByRole('button', { name: /ดูทั้งหมด/i })
        fireEvent.click(showMoreBtn)

        expect(screen.getByText('Z Donation')).toBeInTheDocument()

        const showLessBtn = screen.getByRole('button', { name: /ย่อรายการ/i })
        fireEvent.click(showLessBtn)

        expect(screen.queryByText('Z Donation')).not.toBeInTheDocument()
    })
})
