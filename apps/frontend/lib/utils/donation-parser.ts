export interface ParsedDonation {
    name: string | null;
    description: string | null;
    accountNumber: string | null;
    accountName: string | null;
    bankName: string | null;
    contacts: { type: string; value: string }[];
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
    let accountName: string | null = null;
    const contacts: { type: string; value: string }[] = [];

    // 1. Find Account Number
    const accountRegex = /\b\d{3}[- ]?\d{1}[- ]?\d{5}[- ]?\d{1}\b|\b\d{10,15}\b/g;
    const accountMatches = text.match(accountRegex);

    if (accountMatches && accountMatches.length > 0) {
        accountNumber = accountMatches[0];
    }

    // 2. Find Bank Name
    for (const bank of BANK_PATTERNS) {
        if (bank.pattern.test(text)) {
            bankName = bank.name;
            break;
        }
    }

    // 3. Account Name
    const accountNameRegex = /(?:ชื่อบัญชี|Account Name)\s*[:\s]\s*([^\n\r]+)/i;
    const accountNameMatch = text.match(accountNameRegex);
    if (accountNameMatch) {
        let name = accountNameMatch[1].trim();
        if (accountNumber && name.includes(accountNumber)) {
            name = name.replace(accountNumber, '').trim();
        }
        accountName = name;
    }

    // 4. Contacts
    // Phone
    const phoneRegex = /\b0\d{1,2}[- ]?\d{3}[- ]?\d{4}\b/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches) {
        phoneMatches.forEach(phone => {
            if (!contacts.some(c => c.value === phone) && phone !== accountNumber) {
                contacts.push({ type: 'เบอร์โทรศัพท์', value: phone });
            }
        });
    }

    // Line
    const lineRegex = /(?:Line(?:\s+ID)?)\s*[:\s]\s*([@\w\d_.]+)/i;
    const lineMatch = text.match(lineRegex);
    if (lineMatch) {
        contacts.push({ type: 'Line', value: lineMatch[1].trim() });
    }

    // Facebook
    const fbRegex = /(?:FB|Facebook)\s*[:\s]\s*([^\n\r]+)/i;
    const fbMatch = text.match(fbRegex);
    if (fbMatch) {
        contacts.push({ type: 'Facebook', value: fbMatch[1].trim() });
    }

    // 5. Name (Simple Heuristic: First line)
    const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0);
    let name: string | null = null;
    let description: string | null = null;

    if (lines.length > 0) {
        const firstLine = lines[0];
        // Basic check to ensure first line isn't metadata
        if (!firstLine.includes('ชื่อบัญชี') && !firstLine.match(accountRegex) && !firstLine.match(phoneRegex)) {
            name = firstLine;
        }
    }

    return {
        name,
        description,
        accountNumber,
        accountName,
        bankName,
        contacts
    };
}
