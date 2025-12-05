import { parseDonationText } from './donation-parser';

describe('Donation Parser', () => {
    it('extracts account number correctly', () => {
        const text = "เลขที่บัญชี 123-4-56789-0 ธนาคารกสิกรไทย";
        const result = parseDonationText(text);
        expect(result.accountNumber).toBe('123-4-56789-0');
    });

    it('extracts account number without separators', () => {
        const text = "Acc No. 0987654321 SCB";
        const result = parseDonationText(text);
        expect(result.accountNumber).toBe('0987654321');
    });

    it('identifies bank name from thai text', () => {
        const text = "ธนาคารไทยพาณิชย์ สาขาสยาม";
        const result = parseDonationText(text);
        expect(result.bankName).toBe('ไทยพาณิชย์ (SCB)');
    });

    it('identifies bank name from english keyword', () => {
        const text = "KBANK 1234567890";
        const result = parseDonationText(text);
        expect(result.bankName).toBe('กสิกรไทย (KBANK)');
    });

    it('returns null for fields not found', () => {
        const text = "สวัสดีครับ วันนี้อากาศดี";
        const result = parseDonationText(text);
        expect(result.accountNumber).toBeNull();
        expect(result.bankName).toBeNull();
    });
});
