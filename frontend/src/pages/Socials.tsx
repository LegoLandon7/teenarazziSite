import SiteHeader from "../components/SiteHeader.tsx";
import SocialButtonWrapper from "../components/SocialButton.tsx";

export default function Socials() {
    return (
        <>
            <SiteHeader 
                head="Teenarazzi's socials"
                subhead="Every social that Teenarazzi is a part of, and a form of contact as well"
                align="left"
                backLabel="Home"
                backLink="/"
            />

            <SocialButtonWrapper
                socials={[
                    { social: 'reddit', link: 'https://reddit.com/r/teenarazzi', username: 'r/teenarazzi' },
                    { social: 'discord', link: 'https://discord.gg/py9ePyMdec', username: 'Discord Server' },
                    { social: 'instagram', link: 'https://instagram.com/teenarazzi', username: 'Instagram' },
                    { social: 'fandom', link: 'https://teenarazzi.fandom.com/wiki/Teenarazzi_Wiki', username: 'Teenarazzi Wiki' },
                    { social: 'email', link: 'mailto:contact@teenarazzi.com', username: 'contact@teenarazzi.com' },
                    
                ]}
            />
        </>
    );
}