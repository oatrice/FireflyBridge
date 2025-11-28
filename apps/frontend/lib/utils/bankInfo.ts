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
