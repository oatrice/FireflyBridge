import DeployInfo from "./DeployInfo";

export default function Footer() {
    return (
        <footer className="mt-16 pt-8 border-t border-neutral-200">
            <div className="text-center space-y-4">
                <h3 className="text-lg font-bold text-neutral-800">ติดต่อทีมพัฒนา</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                    <a
                        href="https://forms.gle/Wov1KL5bVdajnvkM7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        <span>📝</span>
                        <span>แบบฟอร์มข้อเสนอแนะ</span>
                    </a>
                    <span className="hidden sm:inline text-neutral-300">|</span>
                    <a
                        href="https://www.facebook.com/FireflyBridge/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        <span>👥</span>
                        <span>Facebook Page</span>
                    </a>
                    <span className="hidden sm:inline text-neutral-300">|</span>
                    <a
                        href="https://github.com/oatrice/FireflyBridge"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        <span>💻</span>
                        <span>GitHub (Contribute)</span>
                    </a>
                </div>
                <p className="text-neutral-500 text-xs mt-4">
                    © 2025 Firefly Bridge - Joint Command Center
                </p>

                {/* Deploy Information */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                    <DeployInfo />
                </div>
            </div>
        </footer>
    );
}
