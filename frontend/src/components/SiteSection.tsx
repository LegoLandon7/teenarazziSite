import './SiteSection.scss';

export default function SiteSection({
    head,
    subhead,
    imgUrl,
    align = 'default',
    onEdit,
}: {
    head: string;
    subhead: string;
    imgUrl?: string;
    align?: 'left' | 'right' | 'default';
    onEdit?: () => void;
}) {
    return (
        <header className='site-section'>
            {(imgUrl && align === 'default' || align === 'left') && <img src={imgUrl} />}

            <div className='section-content'>
                <div className='section-heading'>
                    <h1>{head}</h1>
                    {onEdit && (
                        <button className='edit-btn' onClick={onEdit}>
                            Edit
                        </button>
                    )}
                </div>
                <hr />
                <p>{subhead}</p>
            </div>

            {(imgUrl && align === 'right') && <img src={imgUrl} />}
        </header>
    );
}