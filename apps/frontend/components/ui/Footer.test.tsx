import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
    it('renders contact links correctly', () => {
        render(<Footer />)

        expect(screen.getByText('ติดต่อทีมพัฒนา')).toBeInTheDocument()

        const feedbackLink = screen.getByRole('link', { name: /แบบฟอร์มข้อเสนอแนะ/i })
        expect(feedbackLink).toHaveAttribute('href', 'https://forms.gle/Wov1KL5bVdajnvkM7')

        const fbLink = screen.getByRole('link', { name: /Facebook Page/i })
        expect(fbLink).toHaveAttribute('href', 'https://www.facebook.com/FireflyBridge/')

        const githubLink = screen.getByRole('link', { name: /GitHub/i })
        expect(githubLink).toHaveAttribute('href', 'https://github.com/oatrice/FireflyBridge')
    })

    it('renders copyright text', () => {
        render(<Footer />)
        expect(screen.getByText(/© 2025 Firefly Bridge/)).toBeInTheDocument()
    })
})
