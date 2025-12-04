// TypeScript interfaces for Firefly Bridge application

export interface Hotline {
    id: string;
    name: string;
    number?: string;
    numbers?: string[];
    category: string;
    categories?: string[];
    description: string;
    color: string;
    links?: {
        facebook?: string;
        website?: string;
        line?: string;
        instagram?: string[];
        youtube?: string;
    };
    isPopular?: boolean;
    displayOrder?: number;
}

export interface ExternalLink {
    id: string;
    name: string;
    url: string;
    description: string;
    category: string;
    icon: string;
}

export interface Shelter {
    id: string;
    name: string;
    location: string;
    status: string;
    contacts: Array<{ name: string; phone: string }>;
    area?: string;
    icon?: string;
    link?: string;
}

export interface DonationChannel {
    id: string;
    name: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    description?: string;
    qrCodeUrl?: string;
    contacts?: { name: string; phone: string; type?: string }[];
    donationPoints?: string[];
    acceptsMoney?: boolean;
    bankAccounts?: { id?: string; bankName: string; accountNumber: string; accountName: string }[];
}

export interface BankInfo {
    color: string;
    icon: string;
    short: string;
}

export const TYPES_VERSION = '1.0.0';
