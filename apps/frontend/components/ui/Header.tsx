export default function Header() {
    return (
        <header className="mb-12 text-center">
            <div className="flex flex-col items-center">
                <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span className="text-5xl">🛟</span>
                        Firefly Bridge
                    </h1>
                </div>
                <p className="text-neutral-700 text-lg font-medium mt-4 bg-white/60 backdrop-blur-sm inline-block px-6 py-2 rounded-full shadow-sm">
                    ศูนย์รวมข้อมูลและประสานงานภัยพิบัติ
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdauJYHcAqhIEgsWqEtAXo_5VptI-xt4L3VVASfvuLlohHxZA/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <span className="text-2xl">🏃</span>
                    <div className="text-left">
                        <div className="font-bold text-lg leading-tight">
                            แบบฟอร์มอพยพ
                        </div>
                        <div className="text-xs text-orange-100 font-medium">
                            ศูนย์ประสานงานอพยพ ม.อ.
                        </div>
                    </div>
                </a>

                <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdldl2Dn-ir7jTLP1EsW1E6aYfH9dcQe0CKFD6TGv2KhwaNgw/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <span className="text-2xl">✅</span>
                    <div className="text-left">
                        <div className="font-bold text-lg leading-tight">
                            กรอกรายชื่อผู้ที่ได้รับการอพยพแล้ว
                        </div>
                        <div className="text-xs text-teal-100 font-medium">
                            (🚫ไม่ใช่ฟอร์มขอความช่วยเหลือ)
                        </div>
                    </div>
                </a>

                <a
                    href="https://www.thaihelpcenter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <span className="text-2xl">📋</span>
                    <div className="text-left">
                        <div className="font-bold text-lg leading-tight">
                            ตรวจสอบรายชื่อ
                        </div>
                        <div className="text-xs text-blue-100 font-medium">
                            ผู้ที่ได้รับการช่วยเหลือไปยังศูนย์พักพิง
                        </div>
                    </div>
                </a>

                <a
                    href="https://hakon.psu.ac.th/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <span className="text-2xl">👥</span>
                    <div className="text-left">
                        <div className="font-bold text-lg leading-tight">
                            ค้นหาคนรู้จัก
                        </div>
                        <div className="text-xs text-purple-100 font-medium">
                            ระบบค้นหาคนรู้จัก ม.อ.
                        </div>
                    </div>
                </a>
            </div>
        </header>
    );
}
