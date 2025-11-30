import { getBankInfo } from './bankInfo';

describe('getBankInfo', () => {
    it('returns KBANK info correctly', () => {
        const banks = ['กสิกร', 'kbank', 'kasikorn', 'ธนาคารกสิกรไทย'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-green-600', icon: '🟩', short: 'KBANK' });
        });
    });

    it('returns SCB info correctly', () => {
        const banks = ['ไทยพาณิชย์', 'scb', 'ธนาคารไทยพาณิชย์'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-purple-600', icon: '🟪', short: 'SCB' });
        });
    });

    it('returns BBL info correctly', () => {
        const banks = ['กรุงเทพ', 'bbl', 'bangkok', 'ธนาคารกรุงเทพ'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-blue-700', icon: '🟦', short: 'BBL' });
        });
    });

    it('returns KTB info correctly', () => {
        const banks = ['กรุงไทย', 'ktb', 'ธนาคารกรุงไทย'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-blue-600', icon: '💎', short: 'KTB' });
        });
    });

    it('returns BAY info correctly', () => {
        const banks = ['กรุงศรี', 'bay', 'krungsri', 'ธนาคารกรุงศรีอยุธยา'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-yellow-700', icon: '🟨', short: 'BAY' });
        });
    });

    it('returns GSB info correctly', () => {
        const banks = ['ออมสิน', 'gsb', 'ธนาคารออมสิน'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-pink-600', icon: '🍧', short: 'GSB' });
        });
    });

    it('returns BAAC info correctly', () => {
        const banks = ['ธ.ก.ส.', 'baac'];
        banks.forEach(bank => {
            const info = getBankInfo(bank);
            expect(info).toEqual({ color: 'bg-green-700', icon: '🌾', short: 'BAAC' });
        });
    });

    it('returns default info for unknown bank', () => {
        const info = getBankInfo('Unknown Bank');
        expect(info).toEqual({ color: 'bg-neutral-800', icon: '🏦', short: 'Bank' });
    });

    it('is case insensitive', () => {
        expect(getBankInfo('KBANK')).toEqual({ color: 'bg-green-600', icon: '🟩', short: 'KBANK' });
        expect(getBankInfo('kbank')).toEqual({ color: 'bg-green-600', icon: '🟩', short: 'KBANK' });
    });
});
