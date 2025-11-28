export default function NavigationBar() {
    return (
        <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl backdrop-blur-sm border-b border-white/10 rounded-b-2xl">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 lg:gap-4 py-4 overflow-x-auto scrollbar-hide">
                    <a
                        href="#shelters"
                        className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
                    >
                        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                        <span className="relative text-lg sm:text-xl">🏠</span>
                        <span className="relative">ศูนย์พักพิง</span>
                    </a>
                    <a
                        href="#donations"
                        className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
                    >
                        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                        <span className="relative text-lg sm:text-xl">❤️</span>
                        <span className="relative">รับบริจาค</span>
                    </a>
                    <a
                        href="#external"
                        className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
                    >
                        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                        <span className="relative text-lg sm:text-xl">🔗</span>
                        <span className="relative">แพลตฟอร์ม</span>
                    </a>
                    <a
                        href="#hotlines"
                        className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-4 lg:px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-sm lg:text-base font-semibold relative overflow-hidden flex-shrink-0"
                    >
                        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></span>
                        <span className="relative text-lg sm:text-xl">📞</span>
                        <span className="relative">เบอร์ฉุกเฉิน</span>
                    </a>
                </div>
            </div>
        </nav>
    );
}
