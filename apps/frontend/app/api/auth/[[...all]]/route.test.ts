import { GET, POST } from './route';

jest.mock('@/lib/auth', () => ({
    auth: {},
}));

jest.mock('better-auth/next-js', () => ({
    toNextJsHandler: jest.fn(() => ({
        GET: jest.fn(),
        POST: jest.fn(),
    })),
}));

describe('Auth API', () => {
    it('exports GET and POST handlers', () => {
        expect(GET).toBeDefined();
        expect(POST).toBeDefined();
    });
});
