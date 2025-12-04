import type { BankInfo } from "../types";

/**
 * Get bank information including color, icon, and short name
 * @param bankName - Full or partial bank name
 * @returns Bank information object
 */
export function getBankInfo(bankName: string): BankInfo {
    const name = bankName.toLowerCase();

    if (name.includes("กสิกร") || name.includes("kbank") || name.includes("kasikorn")) {
        return { color: "bg-green-600", icon: "🟩", short: "KBANK" };
    }
    if (name.includes("ไทยพาณิชย์") || name.includes("scb")) {
        return { color: "bg-purple-600", icon: "🟪", short: "SCB" };
    }
    if (name.includes("กรุงเทพ") || name.includes("bbl") || name.includes("bangkok")) {
        return { color: "bg-blue-700", icon: "🟦", short: "BBL" };
    }
    if (name.includes("กรุงไทย") || name.includes("ktb")) {
        return { color: "bg-blue-600", icon: "💎", short: "KTB" };
    }
    if (name.includes("กรุงศรี") || name.includes("bay") || name.includes("krungsri")) {
        return { color: "bg-yellow-700", icon: "🟨", short: "BAY" };
    }
    if (name.includes("ออมสิน") || name.includes("gsb")) {
        return { color: "bg-pink-600", icon: "🍧", short: "GSB" };
    }
    if (name.includes("ธ.ก.ส.") || name.includes("baac")) {
        return { color: "bg-green-700", icon: "🌾", short: "BAAC" };
    }

    return { color: "bg-neutral-800", icon: "🏦", short: "Bank" };
}

export const BANK_OPTIONS = [
    { value: "กสิกรไทย (KBANK)", label: "กสิกรไทย (KBANK)" },
    { value: "ไทยพาณิชย์ (SCB)", label: "ไทยพาณิชย์ (SCB)" },
    { value: "กรุงเทพ (BBL)", label: "กรุงเทพ (BBL)" },
    { value: "กรุงไทย (KTB)", label: "กรุงไทย (KTB)" },
    { value: "กรุงศรี (BAY)", label: "กรุงศรี (BAY)" },
    { value: "ออมสิน (GSB)", label: "ออมสิน (GSB)" },
    { value: "ธ.ก.ส. (BAAC)", label: "ธ.ก.ส. (BAAC)" },
    { value: "ทหารไทยธนชาต (TTB)", label: "ทหารไทยธนชาต (TTB)" },
    { value: "เกียรตินาคินภัทร (KKP)", label: "เกียรตินาคินภัทร (KKP)" },
    { value: "ซีไอเอ็มบี ไทย (CIMBT)", label: "ซีไอเอ็มบี ไทย (CIMBT)" },
    { value: "ทิสโก้ (TISCO)", label: "ทิสโก้ (TISCO)" },
    { value: "ยูโอบี (UOB)", label: "ยูโอบี (UOB)" },
    { value: "แลนด์ แอนด์ เฮ้าส์ (LH Bank)", label: "แลนด์ แอนด์ เฮ้าส์ (LH Bank)" },
    { value: "ไอซีบีซี (ICBC)", label: "ไอซีบีซี (ICBC)" },
    { value: "อื่น ๆ", label: "อื่น ๆ" },
];
