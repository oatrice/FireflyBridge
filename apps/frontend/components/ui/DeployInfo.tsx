"use client";

interface DeployInfoProps { }

export default function DeployInfo({ }: DeployInfoProps) {
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
    const gitCommitSha = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

    // Generate build number from timestamp (YYYYMMDD-HHMM)
    const getBuildNumber = (isoString: string | undefined): string => {
        if (!isoString) return "unknown";

        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}${month}${day}-${hours}${minutes}`;
    };

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
    const buildNumber = getBuildNumber(buildTime);
    const isProduction = vercelEnv === 'production';

    // Only show Git hash in non-production environments
    const shortSha = !isProduction && gitCommitSha && gitCommitSha !== 'local'
        ? gitCommitSha.substring(0, 7)
        : null;
    const commitUrl = shortSha
        ? `https://github.com/oatrice/FireflyBridge/commit/${gitCommitSha}`
        : null;

    return (
        <div className="flex flex-col items-center gap-2 text-xs text-neutral-500">
            {/* Environment Badge */}
            <div className={`px-3 py-1 rounded-full border ${envBadge.color} font-medium`}>
                {envBadge.label}
            </div>

            {/* Version with Build Number */}
            {appVersion && (
                <div className="flex items-center gap-1 font-semibold text-neutral-700">
                    <span>🏷️</span>
                    <span>Version {appVersion} (Build {buildNumber})</span>
                </div>
            )}

            {/* Deploy Time */}
            <div className="flex items-center gap-1">
                <span>🕒</span>
                <span>Deploy: {formatThaiDate(buildTime)}</span>
            </div>

            {/* Git Commit - Only in non-production */}
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

            {/* Show local indicator in development */}
            {!isProduction && gitCommitSha === 'local' && (
                <div className="flex items-center gap-1 text-neutral-400">
                    <span>💻</span>
                    <span className="font-mono">local</span>
                </div>
            )}
        </div>
    );
}
