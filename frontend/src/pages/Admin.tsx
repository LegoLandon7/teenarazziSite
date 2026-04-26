import { useEffect, useState } from 'react'

const API = 'https://api.teenarazzi.com/v2'

// ── types ─────────────────────────────────────────────────────────────────────

type Section = {
    id: number
    content: string
    last_updated: number
}

type Update = {
    id: number
    section: number
    content: string
    submitted_by: string
    status: 'pending' | 'approved' | 'rejected'
    admin_note: string | null
    created_at: number
    reviewed_at: number | null
}

type Tab = 'pending' | 'approved' | 'rejected'

// ── diff util ─────────────────────────────────────────────────────────────────

function computeDiff(oldText: string, newText: string) {
    const oldWords = oldText.split(/(\s+)/)
    const newWords = newText.split(/(\s+)/)
    const result: { text: string; type: 'same' | 'added' | 'removed' }[] = []

    let i = 0, j = 0
    while (i < oldWords.length || j < newWords.length) {
        if (i >= oldWords.length) {
            result.push({ text: newWords[j++], type: 'added' })
        } else if (j >= newWords.length) {
            result.push({ text: oldWords[i++], type: 'removed' })
        } else if (oldWords[i] === newWords[j]) {
            result.push({ text: oldWords[i++], type: 'same' })
            j++
        } else {
            result.push({ text: oldWords[i++], type: 'removed' })
            result.push({ text: newWords[j++], type: 'added' })
        }
    }
    return result
}

// ── diff view ─────────────────────────────────────────────────────────────────

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
    const diff = computeDiff(oldText, newText)
    return (
        <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.7,
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm) var(--space-md)',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
        }}>
            {diff.map((part, i) => (
                <span key={i} style={{
                    background: part.type === 'added'
                        ? 'rgba(47,250,108,0.18)'
                        : part.type === 'removed'
                        ? 'rgba(220,38,38,0.15)'
                        : 'transparent',
                    color: part.type === 'added'
                        ? 'var(--success)'
                        : part.type === 'removed'
                        ? 'var(--danger)'
                        : 'var(--text)',
                    textDecoration: part.type === 'removed' ? 'line-through' : 'none',
                    borderRadius: '2px',
                    padding: part.type === 'same' ? '0' : '0 2px',
                }}>
                    {part.text}
                </span>
            ))}
        </p>
    )
}

// ── update card ───────────────────────────────────────────────────────────────

function UpdateCard({
    update,
    section,
    onApprove,
    onReject,
    onFill,
}: {
    update: Update
    section: Section | undefined
    onApprove: (id: number, note: string) => void
    onReject: (id: number, note: string) => void
    onFill: (sectionId: number, content: string) => void
}) {
    const [note, setNote] = useState('')

    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    Section {update.section} — <strong style={{ color: 'var(--text)' }}>{update.submitted_by}</strong>
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                    {new Date(update.created_at * 1000).toLocaleString()}
                </span>
            </div>

            {section && (
                <DiffView oldText={section.content} newText={update.content} />
            )}

            {update.admin_note && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', margin: 0 }}>
                    Note: {update.admin_note}
                </p>
            )}

            {update.status === 'pending' && (
                <>
                    <button
                        onClick={() => onFill(update.section, update.content)}
                        style={{
                            alignSelf: 'flex-start',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--accent)',
                            padding: 0,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        ↗ Use this as edit
                    </button>

                    <input
                        placeholder="Admin note (optional)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button
                            onClick={() => onApprove(update.id, note)}
                            style={{
                                background: 'var(--success)',
                                color: '#fff',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-xs) var(--space-md)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                            }}
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(update.id, note)}
                            style={{
                                background: 'var(--danger)',
                                color: '#fff',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-xs) var(--space-md)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                            }}
                        >
                            Reject
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

// ── section editor ────────────────────────────────────────────────────────────

function SectionEditor({
    section,
    value,
    onChange,
    onSave,
}: {
    section: Section
    value: string
    onChange: (v: string) => void
    onSave: () => void
}) {
    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>
                    Section {section.id}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                    Last updated: {new Date(section.last_updated * 1000).toLocaleString()}
                </span>
            </div>
            <textarea
                rows={5}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ width: '100%', resize: 'none', fontSize: 'var(--text-sm)', color: 'var(--text)' }}
            />
            <button
                onClick={onSave}
                style={{
                    alignSelf: 'flex-end',
                    background: 'var(--accent)',
                    color: '#000',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-xs) var(--space-md)',
                    fontWeight: 'var(--weight-medium)',
                    fontSize: 'var(--text-sm)',
                }}
            >
                Save
            </button>
        </div>
    )
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Admin() {
    const [secret, setSecret] = useState(sessionStorage.getItem('admin_secret') ?? '')
    const [authed, setAuthed] = useState(false)
    const [loginInput, setLoginInput] = useState('')
    const [loginError, setLoginError] = useState('')

    const [sections, setSections] = useState<Section[]>([])
    const [updates, setUpdates] = useState<Update[]>([])
    const [editContent, setEditContent] = useState<Record<number, string>>({})
    const [tab, setTab] = useState<Tab>('pending')
    const [view, setView] = useState<'sections' | 'updates'>('sections')

    async function login(input: string) {
        const res = await fetch(`${API}/about/updates`, {
            headers: { 'X-Admin-Secret': input }
        })
        if (res.ok) {
            sessionStorage.setItem('admin_secret', input)
            setSecret(input)
            setAuthed(true)
            setLoginError('')
        } else {
            setLoginError('Invalid secret')
        }
    }

    function logout() {
        sessionStorage.removeItem('admin_secret')
        setAuthed(false)
        setSecret('')
    }

    async function loadSections() {
        const res = await fetch(`${API}/about`)
        const data: Section[] = await res.json()
        setSections(data)
        setEditContent(Object.fromEntries(data.map(s => [s.id, s.content])))
    }

    async function loadUpdates() {
        const res = await fetch(`${API}/about/updates`, {
            headers: { 'X-Admin-Secret': secret }
        })
        const data: Update[] = await res.json()
        setUpdates(data)
    }

    useEffect(() => {
        if (authed) {
            loadSections()
            loadUpdates()
        }
    }, [authed])

    async function saveSection(id: number) {
        await fetch(`${API}/about/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': secret },
            body: JSON.stringify({ content: editContent[id] })
        })
        loadSections()
    }

    async function reviewUpdate(id: number, status: 'approved' | 'rejected', note: string) {
        await fetch(`${API}/about/updates/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': secret },
            body: JSON.stringify({ status, admin_note: note || null })
        })
        await loadUpdates()
        if (status === 'approved') loadSections()
    }

    async function clearRejected() {
        await fetch(`${API}/about/updates/rejected`, {
            method: 'DELETE',
            headers: { 'X-Admin-Secret': secret }
        })
        loadUpdates()
    }

    function fillSection(sectionId: number, content: string) {
        setEditContent(prev => ({ ...prev, [sectionId]: content }))
        setView('sections')
    }

    // ── login screen ──────────────────────────────────────────────────────────

    if (!authed) {
        return (
            <div style={{
                maxWidth: 360,
                margin: '120px auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)',
                padding: '0 var(--space-md)',
            }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Admin</h2>
                <input
                    type="password"
                    placeholder="Enter admin secret"
                    value={loginInput}
                    onChange={e => setLoginInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && login(loginInput)}
                />
                <button
                    onClick={() => login(loginInput)}
                    style={{
                        background: 'var(--accent)',
                        color: '#000',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-sm) var(--space-md)',
                        fontWeight: 'var(--weight-medium)',
                        fontSize: 'var(--text-sm)',
                    }}
                >
                    Login
                </button>
                {loginError && (
                    <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', margin: 0 }}>
                        {loginError}
                    </p>
                )}
            </div>
        )
    }

    const pending  = updates.filter(u => u.status === 'pending')
    const approved = updates.filter(u => u.status === 'approved')
    const rejected = updates.filter(u => u.status === 'rejected')
    const tabUpdates = { pending, approved, rejected }[tab]

    // ── tab label ─────────────────────────────────────────────────────────────

    const tabStyle = (t: Tab | 'sections') => ({
        padding: 'var(--space-xs) var(--space-md)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)' as const,
        background: (view === 'sections' ? t === 'sections' : view === 'updates' && tab === t)
            ? 'var(--bg-subtle)'
            : 'transparent',
        color: (view === 'sections' ? t === 'sections' : view === 'updates' && tab === t)
            ? 'var(--text)'
            : 'var(--text-muted)',
        transition: 'var(--transition)',
    })

    // ── panel ─────────────────────────────────────────────────────────────────

    return (
        <div style={{
            width: '100%',
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            padding: 'var(--space-lg) var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
        }}>

            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', margin: 0 }}>
                    Admin Panel
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <button
                        onClick={() => { loadSections(); loadUpdates() }}
                        style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}
                    >
                        ↻ Refresh
                    </button>
                    <button
                        onClick={logout}
                        style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* nav */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-xs)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-xs)',
                border: '1px solid var(--border)',
                width: 'fit-content',
            }}>
                <button style={tabStyle('sections')} onClick={() => setView('sections')}>
                    Sections
                </button>
                <button style={tabStyle('pending')} onClick={() => { setView('updates'); setTab('pending') }}>
                    Pending {pending.length > 0 && `(${pending.length})`}
                </button>
                <button style={tabStyle('approved')} onClick={() => { setView('updates'); setTab('approved') }}>
                    Approved
                </button>
                <button style={tabStyle('rejected')} onClick={() => { setView('updates'); setTab('rejected') }}>
                    Rejected {rejected.length > 0 && `(${rejected.length})`}
                </button>
            </div>

            {/* sections view */}
            {view === 'sections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {sections.map(s => (
                        <SectionEditor
                            key={s.id}
                            section={s}
                            value={editContent[s.id] ?? ''}
                            onChange={v => setEditContent(prev => ({ ...prev, [s.id]: v }))}
                            onSave={() => saveSection(s.id)}
                        />
                    ))}
                </div>
            )}

            {/* updates view */}
            {view === 'updates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {tab === 'rejected' && rejected.length > 0 && (
                        <button
                            onClick={clearRejected}
                            style={{
                                alignSelf: 'flex-start',
                                color: 'var(--danger)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                            }}
                        >
                            Clear all rejected ({rejected.length})
                        </button>
                    )}

                    {tabUpdates.length === 0 ? (
                        <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)' }}>
                            No {tab} updates.
                        </p>
                    ) : tabUpdates.map(u => (
                        <UpdateCard
                            key={u.id}
                            update={u}
                            section={sections.find(s => s.id === u.section)}
                            onApprove={(id, note) => reviewUpdate(id, 'approved', note)}
                            onReject={(id, note) => reviewUpdate(id, 'rejected', note)}
                            onFill={fillSection}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}