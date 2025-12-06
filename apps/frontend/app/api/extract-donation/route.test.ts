/**
 * @jest-environment node
 */
// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn();

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: mockGetGenerativeModel,
            };
        }),
    };
});

// Import after mocks and variables are defined
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { POST } = require('./route');

describe('POST /api/extract-donation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetGenerativeModel.mockReturnValue({
            generateContent: mockGenerateContent,
        });
    });

    it('returns 400 if image is missing', async () => {
        const req = new Request('http://localhost/api/extract-donation', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe('Image is required');
    });

    it('successfully extracts data', async () => {
        const mockData = {
            name: 'Test Org',
            description: 'Test Desc',
            bankName: 'KBANK',
            accountNumber: '123456',
            accountName: 'Test Account',
            contacts: [],
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockData),
            },
        });

        const req = new Request('http://localhost/api/extract-donation', {
            method: 'POST',
            body: JSON.stringify({ image: 'data:image/jpeg;base64,base64string' }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual(mockData);
        expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.0-flash' });
    });

    it('handles markdown code blocks in response', async () => {
        const mockData = { name: 'Test Org' };
        const markdownResponse = '```json\n' + JSON.stringify(mockData) + '\n```';

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => markdownResponse,
            },
        });

        const req = new Request('http://localhost/api/extract-donation', {
            method: 'POST',
            body: JSON.stringify({ image: 'base64string' }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual(mockData);
    });

    it('returns 500 if JSON parse fails', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Invalid JSON',
            },
        });

        const req = new Request('http://localhost/api/extract-donation', {
            method: 'POST',
            body: JSON.stringify({ image: 'base64string' }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.error).toBe('Failed to parse AI response');
    });

    it('returns 500 if Gemini API fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API Error'));

        const req = new Request('http://localhost/api/extract-donation', {
            method: 'POST',
            body: JSON.stringify({ image: 'base64string' }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.error).toBe('Failed to process image');
    });
});
