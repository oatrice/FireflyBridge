import { NextResponse } from "next/server";

const BANK_OPTIONS = [
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

export async function GET() {
    return NextResponse.json(BANK_OPTIONS);
}
