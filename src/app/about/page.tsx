/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /about
 */

import { Metadata } from "next"

import { AppPage, PageTitle } from "@/components/app-page"
import { Heading, Paragraph } from "@/components/ui/typography"
import { EmailLink } from "@/components/ui/link"



export const metadata: Metadata = { title: "About | RT+" }

export default function AboutPage() {
    return <AppPage label="About" className="flex flex-col gap-8 max-w-4xl">
        <PageTitle>About</PageTitle>
        
        <section>
            <Heading level={2}>Introduction</Heading>
            <Paragraph>
                RT+ is a collection of web based tools for managing response teams. It started as a work-around to dealing with multiple teams in D4H but now includes other features independent of D4H.
            </Paragraph>
        </section>

        <section>
            <Heading level={2}>Technology</Heading>
            <Paragraph>RT+ is build using a number of cutting edge web technologies:</Paragraph>
            <ul className="list-disc ml-4 mt-4">
                {technologies.map(tech =>
                    <li key={tech.name}>
                        <a 
                            className="hover:underline"
                            href={tech.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >{tech.name}</a> - <span>{tech.description}</span>
                    </li>
                )}   
            </ul>
        </section>
        <section>
            <Heading level={2}>Cost</Heading>
            <Paragraph>
                Our hosting costs are kindly covered by Redcloud Development. This allows us to offer RT+ for free to any New Zealand based Response Teams.
            </Paragraph>
        </section>
        <section>
            <Heading level={2}>Development</Heading>
            <Paragraph>
                Development of RT+ is a volunteer effort. 
            </Paragraph>
            <Paragraph>
                If you would like to contribute (design, programming, or qualitiy assurance) contact <EmailLink email="support@rtplus.nz"/>.
            </Paragraph>
        </section>
    </AppPage>
}

const technologies: { name: string, url: string, description: string }[] = [
    { name: "Clerk", url: "https://clerk.com", description: "Comprehensive user managment platform."},
    { name: "Github", url: "https://github.com/", description: "Code management platform.", },
    { name: "Lucide Icons", url: "https://lucide.dev/icons/", description: "Large simple SVG based icon set." },
    { name: "Neon Postgres", url: "https://neon.tech", description: "Serverless Postgres database." },
    { name: 'Next.js', url: "https://nextjs.org/", description: "Web application framework built using React components." },
    { name: 'Prisma', url: "https://www.prisma.io/", description: "Typescript ORM." },
    { name: 'Radix Primitives', url: "https://www.radix-ui.com/primitives", description: "Unstyled, accessible, React primitives." },
    { name: 'React', url: "https://react.dev/", description: "Library for building user interfaces based on components." },
    { name: 'shadcn/ui', url: "https://ui.shadcn.com/", description: "React component library styled with Tailwind CSS."},
    { name: 'Tailwind CSS', url: "https://tailwindcss.com/", description: "Utility first CSS framework."},
    { name: 'TanStack Query', url: "https://tanstack.com/query/latest", description: "Client side data synchronisation library." },
    { name: 'TanStack Table', url: "https://tanstack.com/table/latest", description: "Headless UI for building tables and datagrids." },
    { name: 'Typescript', url: "https://www.typescriptlang.org/", description: "Strongly typed programming language that builds on JavaScript." },
    { name: "Vercel", url: "https://vercel.com/", description: "Cloud hosting for Next.js" }
]