export interface ParsedDonation {
    accountNumber: string | null;
    bankName: string | null;
}

const BANK_PATTERNS = [
    { pattern: /(กสิกร|kbank)/i, name: 'กสิกรไทย (KBANK)' },
    { pattern: /(ไทยพาณิชย์|scb)/i, name: 'ไทยพาณิชย์ (SCB)' },
    { pattern: /(กรุงเทพ|bbl|bangkok bank)/i, name: 'กรุงเทพ (BBL)' },
    { pattern: /(กรุงไทย|ktb)/i, name: 'กรุงไทย (KTB)' },
    { pattern: /(ออมสิน|gsb)/i, name: 'ออมสิน (GSB)' },
    { pattern: /(กรุงศรี|bay|krungsri)/i, name: 'กรุงศรีอยุธยา (BAY)' },
    { pattern: /(ทหารไทย|ธนชาต|ttb)/i, name: 'ทีเอ็มบีธนชาต (TTB)' },
    { pattern: /(ธ\.ก\.ส\.|baac)/i, name: 'เพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)' },
];

export function parseDonationText(text: string): ParsedDonation {
    let accountNumber: string | null = null;
    let bankName: string | null = null;

    // 1. Find Account Number
    // Look for 10-15 digits, optionally separated by hyphens or spaces
    // Regex explanation:
    // \b start of word boundary
    // \d{3} first 3 digits
    // [- ]? optional separator
    // \d{1,6} middle digits
    // ... and so on to cover common formats like xxx-x-xxxxx-x
    const accountRegex = /\b\d{3}[- ]?\d{1}[- ]?\d{5}[- ]?\d{1}\b|\b\d{10,15}\b/g;
    const accountMatches = text.match(accountRegex);

    if (accountMatches && accountMatches.length > 0) {
        // Pick the first one that looks most like an account number
        accountNumber = accountMatches[0];
    }

    // 2. Find Bank Name
    for (const bank of BANK_PATTERNS) {
        if (bank.pattern.test(text)) {
            bankName = bank.name;
            break; // Stop at first match
        }
    }

    return {
        accountNumber,
        bankName
    };
}
