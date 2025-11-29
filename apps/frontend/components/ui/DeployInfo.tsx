"use client";

interface DeployInfoProps { }

export default function DeployInfo({ }: DeployInfoProps) {
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
    const gitCommitSha = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

    // Format Thai date
    const formatThaiDate = (isoString: string | undefined): string => {
        if (!isoString) return "ไม่ทราบวันที่";

        const date = new Date(isoString);
        const thaiMonths = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];

        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543; // Convert to Buddhist Era
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
    };

    // Get environment badge config
    const getEnvBadge = () => {
        switch (vercelEnv) {
            case 'production':
                return { label: 'Production', color: 'bg-green-100 text-green-700 border-green-300' };
            case 'preview':
                return { label: 'Preview', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
            default:
                return { label: 'Development', color: 'bg-blue-100 text-blue-700 border-blue-300' };
        }
    };

    const envBadge = getEnvBadge();
    const shortSha = gitCommitSha && gitCommitSha !== 'local' ? gitCommitSha.substring(0, 7) : gitCommitSha;
    const commitUrl = gitCommitSha && gitCommitSha !== 'local'
        ? `https://github.com/oatrice/FireflyBridge/commit/${gitCommitSha}`
        : null;

    return (
        <div className="flex flex-col items-center gap-2 text-xs text-neutral-500">
            {/* Environment Badge */}
            <div className={`px-3 py-1 rounded-full border ${envBadge.color} font-medium`}>
                {envBadge.label}
            </div>

            {/* Deploy Time */}
            <div className="flex items-center gap-1">
                <span>🕒</span>
                <span>Deploy: {formatThaiDate(buildTime)}</span>
            </div>

            {/* Git Commit */}
            {shortSha && (
                <div className="flex items-center gap-1">
                    <span>📝</span>
                    {commitUrl ? (
                        <a
                            href={commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline font-mono"
                        >
                            {shortSha}
                        </a>
                    ) : (
                        <span className="font-mono">{shortSha}</span>
                    )}
                </div>
            )}
        </div>
    );
}
