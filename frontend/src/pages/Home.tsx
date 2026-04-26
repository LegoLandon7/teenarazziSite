import { useEffect, useState } from "react";
import Card from "../components/Card.tsx";
import SiteHeader from "../components/SiteHeader.tsx";
import SocialInfo from "../components/SocialInfo.tsx";

const API = "https://api.teenarazzi.com/v2";

export default function Home() {
    const [discord, setDiscord] = useState<any>(null);
    const [reddit, setReddit] = useState<any>(null);

    useEffect(() => {
        const cached = localStorage.getItem("socialStats");
        if (cached) {
            const parsed = JSON.parse(cached);
            setDiscord(parsed.discord);
            setReddit(parsed.reddit);
            const age = Date.now() - (parsed.cachedAt ?? 0);
            if (age < 5 * 60 * 1000) return; // 5 minutes cache
        }

        async function load() {
            try {
                const [dRes, rRes] = await Promise.all([
                    fetch(`${API}/discord`),
                    fetch(`${API}/reddit`),
                ]);

                const [dJson, rJson] = await Promise.all([
                    dRes.json(),
                    rRes.json(),
                ]);

                const d = dRes.ok ? dJson : null;
                const r = rRes.ok ? rJson : null;

                setDiscord(d);
                setReddit(r);

                localStorage.setItem("socialStats", JSON.stringify({
                    discord: d,
                    reddit: r,
                    cachedAt: Date.now(),
                }));
            } catch {
                // network failure, keep cache
            }
        }

        load();
    }, []);

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
                icon="https://cdn.simpleicons.org/discord"
                stats={[
                    { label: "Members", value: discord?.members ?? 0 },
                    { label: "Online", value: discord?.active_members ?? 0 },
                ]}
                timeStamp={discord?.last_updated ?? null}
            />

            <SocialInfo
                title="Reddit"
                icon="https://cdn.simpleicons.org/reddit"
                stats={[
                    { label: "Members", value: reddit?.members ?? 0 },
                    { label: "Posts Today", value: reddit?.posts_today ?? 0 },
                ]}
                timeStamp={reddit?.last_updated ?? null}
            />
        </>
    );
}