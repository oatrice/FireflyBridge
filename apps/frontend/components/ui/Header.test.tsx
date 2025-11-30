import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
    it('renders the main title correctly', () => {
        render(<Header />)
        expect(screen.getByText('Firefly Bridge')).toBeInTheDocument()
        expect(screen.getByText('ศูนย์รวมข้อมูลและประสานงานภัยพิบัติ')).toBeInTheDocument()
    })

    it('renders all external links with correct hrefs', () => {
        render(<Header />)

        // Evacuation Form
        const evacuationLink = screen.getByRole('link', { name: /แบบฟอร์มอพยพ/i })
        expect(evacuationLink).toHaveAttribute('href', 'https://docs.google.com/forms/d/e/1FAIpQLSdauJYHcAqhIEgsWqEtAXo_5VptI-xt4L3VVASfvuLlohHxZA/viewform')
        expect(evacuationLink).toHaveAttribute('target', '_blank')

        // Check List Form
        const checkListLink = screen.getByRole('link', { name: /กรอกรายชื่อผู้ที่ได้รับการอพยพแล้ว/i })
        expect(checkListLink).toHaveAttribute('href', 'https://docs.google.com/forms/d/e/1FAIpQLSdldl2Dn-ir7jTLP1EsW1E6aYfH9dcQe0CKFD6TGv2KhwaNgw/viewform')

        // Verify Status Link
        const verifyLink = screen.getByRole('link', { name: /ตรวจสอบรายชื่อ/i })
        expect(verifyLink).toHaveAttribute('href', 'https://www.thaihelpcenter.com/')

        // Find Person Link
        const findPersonLink = screen.getByRole('link', { name: /ค้นหาคนรู้จัก/i })
        expect(findPersonLink).toHaveAttribute('href', 'https://hakon.psu.ac.th/')
    })
})
