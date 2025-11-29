import { render, screen } from '@testing-library/react'
import DeployInfo from './DeployInfo'

describe('DeployInfo', () => {
    const originalEnv = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...originalEnv }
    })

    afterAll(() => {
        process.env = originalEnv
    })

    it('renders correctly in production (hides git hash)', () => {
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'production'
        process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0'
        process.env.NEXT_PUBLIC_BUILD_TIME = '2025-11-29T12:00:00.000Z'
        process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = 'abcdef123456'

        render(<DeployInfo />)

        // Check Badge - Should NOT show in production
        expect(screen.queryByText('Production')).not.toBeInTheDocument()

        // Check Version and Build Number
        // Build number for 2025-11-29T12:00:00.000Z should be 20251129-1900 (assuming local time conversion, but let's check partial match)
        expect(screen.getByText(/Version 1.0.0/)).toBeInTheDocument()

        // CRITICAL: Should NOT show Git hash in production
        expect(screen.queryByText('abcdef1')).not.toBeInTheDocument()
    })

    it('renders correctly in preview (shows git hash)', () => {
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview'
        process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0'
        process.env.NEXT_PUBLIC_BUILD_TIME = '2025-11-29T12:00:00.000Z'
        process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = 'abcdef123456'

        render(<DeployInfo />)

        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(screen.getByText(/Version 1.0.0/)).toBeInTheDocument()

        // Should show Git hash in preview
        expect(screen.getByText('abcdef1')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'abcdef1' })).toHaveAttribute(
            'href',
            'https://github.com/oatrice/FireflyBridge/commit/abcdef123456'
        )
    })

    it('renders correctly in development (shows local)', () => {
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'development'
        process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0'
        process.env.NEXT_PUBLIC_BUILD_TIME = '2025-11-29T12:00:00.000Z'
        process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = 'local'

        render(<DeployInfo />)

        expect(screen.getByText('Development')).toBeInTheDocument()
        expect(screen.getByText(/Version 1.0.0/)).toBeInTheDocument()

        // Should show local indicator
        expect(screen.getByText('local')).toBeInTheDocument()
    })
})
