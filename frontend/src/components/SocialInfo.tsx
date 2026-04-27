import "./SocialInfo.scss"

export default function SocialInfo({
    title,
    stats,
    icon,
    onEdit,
    onRefresh,
    refreshing,
    refreshDisabled = false,
    timeStamp,
}: {
    title: string
    icon?: string
    stats: Stat[]
    onEdit?: () => void
    onRefresh?: () => void
    refreshing?: boolean
    refreshDisabled?: boolean
    timeStamp: number
}) {
    return (
        <div className="social-card">
            <div className="social-header">
                <div className="social-title">
                    {icon && <img src={icon} className="social-icon" />}
                    <h3>{title}</h3>
                    <p>{"last updated: " + new Date(timeStamp).toLocaleString()}</p>
                </div>

                <div className="social-actions">
                    {onRefresh && (
                        <button
                            className="social-refresh"
                            onClick={onRefresh}
                            disabled={refreshing || refreshDisabled}
                            aria-label="Refresh"
                        >
                            {refreshing ? "Refreshing..." : "🗘 Refresh"}
                        </button>
                    )}
                    {onEdit && (
                        <button className="social-edit" onClick={onEdit}>Edit</button>
                    )}
                </div>
            </div>

            <div className="social-grid">
                {stats.map((s, i) => (
                    <div key={i} className="social-stat">
                        <span className="social-label">{s.label}</span>
                        <span className="social-value">{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}