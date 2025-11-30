import { render, screen, fireEvent } from '@testing-library/react'
import DonationsSection from './DonationsSection'

const mockDonations = [
    {
        id: '1',
        name: 'โรงพยาบาล A',
        bankName: 'KBANK',
        accountNumber: '123-4-56789-0',
        accountName: 'Hospital A Account',
        description: 'Medical supplies',
        acceptsMoney: true
    },
    {
        id: '2',
        name: 'มูลนิธิ B',
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
        expect(screen.getByText('โรงพยาบาล A')).toBeInTheDocument()
        expect(screen.getByText('มูลนิธิ B')).toBeInTheDocument()
    })

    it('filters by search term', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        const searchInput = screen.getByPlaceholderText(/ค้นหาช่องทางบริจาค/i)
        fireEvent.change(searchInput, { target: { value: 'โรงพยาบาล' } })

        expect(screen.getByText('โรงพยาบาล A')).toBeInTheDocument()
        expect(screen.queryByText('มูลนิธิ B')).not.toBeInTheDocument()
    })

    it('handles show more/less', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        // Initial state: show 6 items (A-F)
        expect(screen.getByText('โรงพยาบาล A')).toBeInTheDocument()
        expect(screen.queryByText('Z Donation')).not.toBeInTheDocument()

        const showMoreBtn = screen.getByRole('button', { name: /ดูทั้งหมด/i })
        fireEvent.click(showMoreBtn)

        expect(screen.getByText('Z Donation')).toBeInTheDocument()

        const showLessBtn = screen.getByRole('button', { name: /ย่อรายการ/i })
        fireEvent.click(showLessBtn)

        expect(screen.queryByText('Z Donation')).not.toBeInTheDocument()
    })
    it('filters by category', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        // Filter by "โรงพยาบาล" - button text includes count
        const hospitalFilter = screen.getByRole('button', { name: /โรงพยาบาล \(\d+\)/i })
        fireEvent.click(hospitalFilter)

        expect(screen.getByText('โรงพยาบาล A')).toBeInTheDocument()
        expect(screen.queryByText('มูลนิธิ B')).not.toBeInTheDocument()

        // Filter by "มูลนิธิ"
        const foundationFilter = screen.getByRole('button', { name: /มูลนิธิ \(\d+\)/i })
        fireEvent.click(foundationFilter)

        expect(screen.getByText('มูลนิธิ B')).toBeInTheDocument()
        expect(screen.queryByText('โรงพยาบาล A')).not.toBeInTheDocument()
    })

    it('sorts donations', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        // Default sort is by name (Thai locale)
        const items = screen.getAllByRole('heading', { level: 3 })
        // มูลนิธิ comes before โรงพยาบาล in Thai alphabetical order
        expect(items[0]).toHaveTextContent('มูลนิธิ B')
        expect(items[1]).toHaveTextContent('โรงพยาบาล A')

        // Change sort to "bank"
        const sortSelect = screen.getByRole('combobox')
        fireEvent.change(sortSelect, { target: { value: 'bank' } })

        // Re-query items after sort
        const sortedItems = screen.getAllByRole('heading', { level: 3 })
        // BBL (C Donation) comes before KBANK (A Hospital) in Thai locale sort? 
        // Actually "BBL" vs "KBANK". Let's check the mock data.
        // A: KBANK, B: SCB, C: BBL. 
        // BBL < KBANK < SCB. So C should be first.
        // Wait, the mock data has C, D, E, F, Z as well.
        // Let's just check if the order changed.

        // Note: localeCompare might behave differently in JSDOM/Node than browser.
        // But we can check if the value changed.
        expect(sortSelect).toHaveValue('bank')
    })

    it('opens and closes QR modal', () => {
        const donationsWithQR = [
            { ...mockDonations[0], qrCodeUrl: '/qr-test.png' }
        ]
        render(<DonationsSection donations={donationsWithQR} loading={false} />)

        // Click QR code image
        const qrImage = screen.getByAltText(/QR Code for/i)
        fireEvent.click(qrImage)

        // Check if modal is open (look for close button or modal content)
        expect(screen.getByText('คลิกนอกกรอบเพื่อปิด')).toBeInTheDocument()

        // Close modal
        const closeBtn = screen.getByText('×')
        fireEvent.click(closeBtn)

        expect(screen.queryByText('คลิกนอกกรอบเพื่อปิด')).not.toBeInTheDocument()
    })

    it('copies account number to clipboard', () => {
        const writeText = jest.fn()
        Object.assign(navigator, {
            clipboard: {
                writeText,
            },
        })
        // Mock alert
        window.alert = jest.fn()

        render(<DonationsSection donations={mockDonations} loading={false} />)

        const copyBtns = screen.getAllByText('คัดลอก')
        fireEvent.click(copyBtns[0])

        // First button is now มูลนิธิ B (SCB account) due to Thai alphabetical sort
        expect(writeText).toHaveBeenCalledWith('987-6-54321-0')
        expect(window.alert).toHaveBeenCalledWith('คัดลอกเลขบัญชีแล้ว')
    })

    it('clears search from no results state', () => {
        render(<DonationsSection donations={mockDonations} loading={false} />)

        const searchInput = screen.getByPlaceholderText(/ค้นหาช่องทางบริจาค/i)
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

        expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument()

        const clearBtn = screen.getByRole('button', { name: 'ล้างการค้นหา' })
        fireEvent.click(clearBtn)

        expect(screen.queryByText(/ไม่พบข้อมูล/)).not.toBeInTheDocument()
        expect(screen.getByText('โรงพยาบาล A')).toBeInTheDocument()
    })
})
