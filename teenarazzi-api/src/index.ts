import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
    STORE: KVNamespace
    teenarazzi_database: D1Database
    RATE_LIMITER: RateLimit
    BOT_TOKEN: string
    ADMIN_SECRET: string
}

const SUBREDDIT = 'teenarazzi'
const GUILD_ID = '1395741172256739348'

const app = new Hono<{ Bindings: Bindings }>().basePath('/v2')

app.use('*', cors())

async function rateLimit(c: any): Promise<boolean> {
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown'
    const { success } = await c.env.RATE_LIMITER.limit({ key: ip })
    return success
}

function isAdmin(c: any): boolean {
    return c.req.header('X-Admin-Secret') === c.env.ADMIN_SECRET
}

async function fetchReddit(env: Bindings): Promise<void> {
    const lock = await env.STORE.get('reddit_lock')
    if (lock) {
        console.log('[reddit] skipped (lock active)')
        return
    }

    await env.STORE.put('reddit_lock', '1', { expirationTtl: 60 })

    try {
        const cachedRaw = await env.STORE.get('reddit')
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw)
            const age = Date.now() - cached.last_updated

            if (age < 10 * 60 * 1000) {
                console.log('[reddit] skipped (fresh cache)')
                return
            }
        }

        const aboutRes = await fetch(`https://www.reddit.com/r/${SUBREDDIT}/about.json`, {
            headers: { 'User-Agent': 'web:teenarazzi-api/2.0 (by u/legomaster_01)' }
        })

        if (aboutRes.status === 429) {
            console.warn('[reddit] rate limited on about.json')
            return
        }

        if (!aboutRes.ok) {
            throw new Error(`Reddit about.json failed: ${aboutRes.status} ${aboutRes.statusText}`)
        }

        const { data } = await aboutRes.json() as any

        await new Promise(r => setTimeout(r, Math.random() * 3000))

        let postsToday: number | null = null

        const newRes = await fetch(`https://www.reddit.com/r/${SUBREDDIT}/new.json?limit=25`, {
            headers: { 'User-Agent': 'web:teenarazzi-api/2.0 (by u/legomaster_01)' }
        })

        if (newRes.status === 429) {
            console.warn('[reddit] rate limited on new.json')
        } else if (!newRes.ok) {
            throw new Error(`Reddit new.json failed: ${newRes.status} ${newRes.statusText}`)
        } else {
            const newData = await newRes.json() as any
            const posts = newData.data.children.map((p: any) => p.data)
            postsToday = posts.filter((p: any) => p.created_utc > Date.now() / 1000 - 86400).length
        }

        await env.STORE.put('reddit', JSON.stringify({
            members: data.subscribers,
            posts_today: postsToday,
            last_updated: Date.now()
        }))

        console.log(`[reddit] updated — ${data.subscribers} members, ${postsToday ?? 'N/A'} posts today`)
    } finally {
        await env.STORE.delete('reddit_lock')
    }
}

async function fetchDiscord(env: Bindings): Promise<void> {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`, {
        headers: { Authorization: `Bot ${env.BOT_TOKEN}` }
    })
    if (!res.ok) throw new Error(`Discord API failed: ${res.status} ${res.statusText}`)

    const data = await res.json() as any

    await env.STORE.put('discord', JSON.stringify({
        members: data.approximate_member_count,
        active_members: data.approximate_presence_count,
        last_updated: Date.now()
    }))

    console.log(`[discord] updated — ${data.approximate_member_count} members, ${data.approximate_presence_count} online`)
}

app.get('/reddit', async (c) => {
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const cached = await c.env.STORE.get('reddit')
    if (!cached) return c.json({ error: 'No data yet' }, 404)
    return c.json(JSON.parse(cached))
})

app.get('/discord', async (c) => {
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const cached = await c.env.STORE.get('discord')
    if (!cached) return c.json({ error: 'No data yet' }, 404)
    return c.json(JSON.parse(cached))
})

app.post('/refresh', async (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)

    const results = await Promise.allSettled([fetchReddit(c.env), fetchDiscord(c.env)])

    const errors: Record<string, string> = {}
    if (results[0].status === 'rejected') errors.reddit = (results[0] as PromiseRejectedResult).reason?.message
    if (results[1].status === 'rejected') errors.discord = (results[1] as PromiseRejectedResult).reason?.message

    if (Object.keys(errors).length > 0) {
        return c.json({ success: false, errors }, 500)
    }

    return c.json({ success: true })
})

app.get('/about', async (c) => {
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const { results } = await c.env.teenarazzi_database
        .prepare('SELECT * FROM about_sections ORDER BY id')
        .all()
    return c.json(results)
})

app.post('/about/updates', async (c) => {
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const { section, content } = await c.req.json()
    if (![1, 2, 3].includes(section)) return c.json({ error: 'Invalid section' }, 400)
    await c.env.teenarazzi_database
        .prepare('INSERT INTO about_updates (section, content) VALUES (?, ?)')
        .bind(section, content)
        .run()
    return c.json({ success: true })
})

app.get('/about/updates', async (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const { results } = await c.env.teenarazzi_database
        .prepare('SELECT * FROM about_updates ORDER BY created_at DESC')
        .all()
    return c.json(results)
})

app.patch('/about/updates/:id', async (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const id = c.req.param('id')
    const { status, admin_note } = await c.req.json()
    if (!['approved', 'rejected'].includes(status)) return c.json({ error: 'Invalid status' }, 400)
    const update = await c.env.teenarazzi_database
        .prepare('SELECT * FROM about_updates WHERE id = ?')
        .bind(id)
        .first() as any
    if (!update) return c.json({ error: 'Update not found' }, 404)
    await c.env.teenarazzi_database
        .prepare('UPDATE about_updates SET status = ?, admin_note = ?, reviewed_at = unixepoch() WHERE id = ?')
        .bind(status, admin_note ?? null, id)
        .run()
    if (status === 'approved') {
        await c.env.teenarazzi_database
            .prepare('UPDATE about_sections SET content = ?, last_updated = unixepoch() WHERE id = ?')
            .bind(update.content, update.section)
            .run()
    }
    return c.json({ success: true })
})

app.delete('/about/updates/rejected', async (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    await c.env.teenarazzi_database
        .prepare('DELETE FROM about_updates WHERE status = ?')
        .bind('rejected')
        .run()
    return c.json({ success: true })
})

app.patch('/about/:id', async (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
    if (!await rateLimit(c)) return c.json({ error: 'Too many requests' }, 429)
    const id = c.req.param('id')
    const { content } = await c.req.json()
    if (!content) return c.json({ error: 'Missing content' }, 400)
    if (![1, 2, 3].includes(Number(id))) return c.json({ error: 'Invalid section' }, 400)
    await c.env.teenarazzi_database
        .prepare('UPDATE about_sections SET content = ?, last_updated = unixepoch() WHERE id = ?')
        .bind(content, id)
        .run()
    return c.json({ success: true })
})

export default {
    fetch: app.fetch,

    async scheduled(_event: ScheduledEvent, env: Bindings) {
        const results = await Promise.allSettled([
            fetchReddit(env),
            fetchDiscord(env),
        ])

        for (const [name, result] of [['reddit', results[0]], ['discord', results[1]]] as const) {
            if (result.status === 'rejected') {
                console.error(`[${name}] fetch failed:`, (result as PromiseRejectedResult).reason?.message)
            }
        }
    }
}