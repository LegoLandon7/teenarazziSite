import { useEffect, useState } from "react"
import Card from "../components/Card.tsx"
import SiteHeader from "../components/SiteHeader.tsx"
import SocialInfo from "../components/SocialInfo.tsx"

const API = "https://api.teenarazzi.com/v2"

export default function Home() {
    const [discord, setDiscord] = useState<any>(null)
    const [reddit, setReddit] = useState<any>(null)

    useEffect(() => {
        async function load() {
            try {
                const dRes = await fetch(`${API}/discord`)
                const dJson = await dRes.json()

                const rRes = await fetch(`${API}/reddit`)
                const rJson = await rRes.json()

                setDiscord(dRes.ok ? dJson : null)
                setReddit(rRes.ok ? rJson : null)
            } catch {
                setDiscord(null)
                setReddit(null)
            }
        }

        load()
    }, [])

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

            {discord && (
                <SocialInfo
                    title="Discord"
                    icon="https://cdn.simpleicons.org/discord"
                    stats={[
                        { label: "Members", value: discord.approximate_member_count ?? 0 },
                        { label: "Online", value: discord.approximate_presence_count ?? 0 }
                    ]}
                    timeStamp={discord.last_updated}
                />
            )}

            {reddit && (
                <SocialInfo
                    title="Reddit"
                    icon="https://cdn.simpleicons.org/reddit"
                    stats={[
                        { label: "Members", value: reddit.subscribers ?? 0},
                        { label: "Weekly Visits", value: reddit.weekly_visits ?? 0}
                    ]}
                    timeStamp={discord.last_updated}
                />
            )}
        </>
    )
}