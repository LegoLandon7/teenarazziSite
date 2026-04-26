import { useRef, useState } from 'react';
import './EditModal.scss';

const API = 'https://api.teenarazzi.com/v2';

export default function EditModal({
    sectionId,
    head,
    current,
    onClose,
}: {
    sectionId: number;
    head: string;
    current: string;
    onClose: () => void;
}) {
    const [value, setValue] = useState(current);
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

    async function submit() {
        if (!value.trim()) return;
        setStatus('loading');
        try {
            const res = await fetch(`${API}/about/updates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: sectionId,
                    content: value.trim(),
                }),
            });
            setStatus(res.ok ? 'done' : 'error');
            if (res.ok) setTimeout(onClose, 1500);
        } catch {
            setStatus('error');
        }
    }

    const pointerDownOnBackdrop = useRef(false);

    return (
        <div
            className="edit-modal-backdrop"
            onPointerDown={(e) => {
                // only track real backdrop press
                pointerDownOnBackdrop.current = e.target === e.currentTarget;
            }}
            onPointerUp={(e) => {
                // only close if it started AND ended on backdrop
                const endedOnBackdrop = e.target === e.currentTarget;

                if (pointerDownOnBackdrop.current && endedOnBackdrop) {
                    onClose();
                }

                pointerDownOnBackdrop.current = false;
            }}
        >
            <div className='edit-modal'>
                {status === 'done' ? (
                    <p className='edit-modal-success'>✓ Suggestion submitted!</p>
                ) : (
                    <>
                        <div className='edit-modal-header'>
                            <h3>Suggest edit — {head}</h3>
                            <button className='close-btn' onClick={onClose}>✕</button>
                        </div>

                        <textarea
                            rows={6}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                        />

                        {status === 'error' && (
                            <p className='edit-modal-error'>Something went wrong. Try again.</p>
                        )}

                        <div className='edit-modal-actions'>
                            <button className='cancel-btn' onClick={onClose}>Cancel</button>
                            <button
                                className='submit-btn'
                                onClick={submit}
                                disabled={status === 'loading' || !value.trim()}
                            >
                                {status === 'loading' ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}