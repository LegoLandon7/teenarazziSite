import { useEffect, useRef, useState } from "react";
import Card from "../components/Card.tsx";
import SiteHeader from "../components/SiteHeader.tsx";
import SocialInfo from "../components/SocialInfo.tsx";

const API = "https://api.teenarazzi.com/v2";

export default function Home() {
    const [discord, setDiscord] = useState<any>(null);
    const [reddit, setReddit] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [discordLoading, setDiscordLoading] = useState(false);
    const [redditLoading, setRedditLoading] = useState(false);
    const [discordCooldown, setDiscordCooldown] = useState(false);
    const [redditCooldown, setRedditCooldown] = useState(false);
    const refreshTimeouts = useRef<{ discord?: number; reddit?: number }>({});
    const cacheKey = "socialStats";

    async function load(force = false) {
        if (!force) {
            const cached = localStorage.getItem("socialStats");
            if (cached) {
                const parsed = JSON.parse(cached);
                setDiscord(parsed.discord);
                setReddit(parsed.reddit);
                const age = Date.now() - (parsed.cachedAt ?? 0);
                if (age < 5 * 60 * 1000) return;
            }
        }

        setLoading(true);
        try {
            const [dRes, rRes] = await Promise.all([
                fetch(`${API}/discord`),
                fetch(`${API}/reddit`),
            ]);
            const [dJson, rJson] = await Promise.all([dRes.json(), rRes.json()]);
            const d = dRes.ok ? dJson : null;
            const r = rRes.ok ? rJson : null;

            setDiscord(d);
            setReddit(r);
            localStorage.setItem("socialStats", JSON.stringify({
                discord: d, reddit: r, cachedAt: Date.now(),
            }));
        } catch {
            // network failure, keep cache
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    useEffect(() => {
        return () => {
            if (refreshTimeouts.current.discord) {
                window.clearTimeout(refreshTimeouts.current.discord);
            }
            if (refreshTimeouts.current.reddit) {
                window.clearTimeout(refreshTimeouts.current.reddit);
            }
        };
    }, []);

    function saveStatsToCache(discordData: any, redditData: any) {
        localStorage.setItem(cacheKey, JSON.stringify({
            discord: discordData,
            reddit: redditData,
            cachedAt: Date.now(),
        }));
    }

    async function refreshDiscord() {
        if (discordCooldown || discordLoading) return;

        setDiscordLoading(true);
        try {
            const res = await fetch(`${API}/discord`);
            const json = await res.json();
            const d = res.ok ? json : discord;

            if (res.ok) setDiscord(d);
            saveStatsToCache(d, reddit);
        } catch {
            // keep existing data if refresh fails
        } finally {
            setDiscordLoading(false);
            setDiscordCooldown(true);
            refreshTimeouts.current.discord = window.setTimeout(() => setDiscordCooldown(false), 60000);
        }
    }

    async function refreshReddit() {
        if (redditCooldown || redditLoading) return;

        setRedditLoading(true);
        try {
            const res = await fetch(`${API}/reddit`);
            const json = await res.json();
            const r = res.ok ? json : reddit;

            if (res.ok) setReddit(r);
            saveStatsToCache(discord, r);
        } catch {
            // keep existing data if refresh fails
        } finally {
            setRedditLoading(false);
            setRedditCooldown(true);
            refreshTimeouts.current.reddit = window.setTimeout(() => setRedditCooldown(false), 60000);
        }
    }

    return (
        <>
            <SiteHeader
                head="Welcome to Teenarazzi!"
                subhead="A social network primarily made for teenagers"
                align="center"
            />

            <Card
                title="About Teenarazzi!"
                description="Teenarazzi is a social network made from discord and reddit primarily to provide a fun and safe way for teens to interact and socialize! Click here to learn more."
                imageUrl="/favicon.png"
                linkUrl="/about"
            />

            <SocialInfo
                title="Discord"
                link="https://discord.gg/py9ePyMdec"
                icon="https://cdn.simpleicons.org/discord"
                stats={[
                    { label: "Members", value: discord?.members ?? 0 },
                    { label: "Online", value: discord?.active_members ?? 0 },
                ]}
                timeStamp={discord?.last_updated ?? null}
                onRefresh={refreshDiscord}
                refreshing={discordLoading}
                refreshDisabled={discordCooldown}
            />

            <SocialInfo
                title="Reddit"
                link="https://reddit.com/r/teenarazzi"
                icon="https://cdn.simpleicons.org/reddit"
                stats={[
                    { label: "Members", value: reddit?.members ?? 0 },
                    { label: "Posts Today", value: reddit?.posts_today ?? 0 },
                ]}
                timeStamp={reddit?.last_updated ?? null}
                onRefresh={refreshReddit}
                refreshing={redditLoading}
                refreshDisabled={redditCooldown}
            />
        </>
    );
}