import "./SocialInfo.scss"

type Stat = {
    label: string
    value: string | number
}

export default function SocialInfo({
    title,
    link,
    stats,
    icon,
    onEdit,
    onRefresh,
    refreshing,
    refreshDisabled = false,
    timeStamp,
}: {
    title: string
    link?: string
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
                    <a href={link || title} target="_blank" rel="noopener noreferrer">
                        {title}
                    </a>
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
                            {refreshing ? "Refreshing..." : "↺ Refresh"}
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