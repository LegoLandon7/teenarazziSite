import { useEffect, useState } from "react"
import SiteHeader from "../components/SiteHeader.tsx"
import SiteSection from "../components/SiteSection.tsx"
import EditModal from "../components/EditModal.tsx"

const API = "https://api.teenarazzi.com/v2"

type Section = {
    id: number
    content: string
    last_updated: number
}

export default function About() {
    const [sections, setSections] = useState<Section[]>([])
    const [editing, setEditing] = useState<number | null>(null)

    useEffect(() => {
        const cached = localStorage.getItem("aboutSections")
        if (cached) setSections(JSON.parse(cached))

        fetch(`${API}/about`)
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return
                setSections(data)
                localStorage.setItem("aboutSections", JSON.stringify(data))
            })
            .catch(() => {})
    }, [])

    const section = (id: number) =>
        sections.find(s => s.id === id)?.content ?? "Loading..."

    const sectionHeads: Record<number, string> = {
        1: "About Us",
        2: "Reddit",
        3: "Discord",
    }

    return (
        <>
            <SiteHeader
                head="About Teenarazzi"
                subhead="Extended information about Teenarazzi"
                align="left"
                backLabel="Home"
                backLink="/"
            />

            <SiteSection
                head="About Us"
                subhead={section(1)}
                imgUrl="/favicon.png"
                align="left"
                onEdit={() => setEditing(1)}
            />

            <SiteSection
                head="Reddit"
                subhead={section(2)}
                onEdit={() => setEditing(2)}
            />

            <SiteSection
                head="Discord"
                subhead={section(3)}
                onEdit={() => setEditing(3)}
            />

            {editing !== null && (
                <EditModal
                    sectionId={editing}
                    head={sectionHeads[editing]}
                    current={section(editing)}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    )
}
