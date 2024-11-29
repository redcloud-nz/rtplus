
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { BookOpenIcon, InfoIcon, ListChecksIcon, NotebookTextIcon, PocketKnifeIcon, Settings2Icon, SquareTerminalIcon, UserCheckIcon, WalletCardsIcon } from "lucide-react"

import { NavItem, NavSection } from '@/components/nav-section'

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import * as Paths from '@/paths'


const navTools: NavItem[] = [
    {
        title: "Availability",
        url: "/availability",
        icon: <UserCheckIcon/>,
    },
    {
        title: "Checklists",
        url: "/checklists",
        icon: <ListChecksIcon/>
    },
    {
        title: "Competencies",
        url: "/competencies",
        icon: <PocketKnifeIcon/>,
        items: [
            {
                title: "Assessments",
                url: Paths.competencyAssessments
            },
            {
                title: "Report",
                url: "/competencies/report"
            }
        ]
    },
    {
        title: "D4H Unified",
        url: "/unified",
        icon: <SquareTerminalIcon/>,
        items: [
            {
                title: "Activities",
                url: "/unified/activities"
            },
            {
                title: "Personnel",
                url: "/unified/personnel",
            },
            {
                title: "Calendar",
                url: "/unified/calendar",
            },
            {
                title: "Equipment",
                url: "/unified/equipment",
            },
        ],
        defaultOpen: true
    },
    {
        title: "Field Operations Guide",
        url: "/fog",
        icon: <NotebookTextIcon/>,
    },
    {
        title: "Reference Cards",
        url: "/cards",
        icon: <WalletCardsIcon/>
    },
  ]

  const navGeneral: NavItem[] = [
    {
        title: "About",
        url: "/about",
        icon: <InfoIcon/>
    },
    {
        title: "Documentation",
        url: "/documentation",
        icon: <BookOpenIcon/>,
        // items: [
        //     {
        //         title: "Introduction",
        //         url: "#",
        //     },
        //     {
        //         title: "Get Started",
        //         url: "#",
        //     },
        //     {
        //         title: "Tutorials",
        //         url: "#",
        //     },
        //     {
        //         title: "Changelog",
        //         url: "#",
        //     },
        // ],
      },
      {
        title: "Configuration",
        url: "/",
        icon: <Settings2Icon/>,
        items: [
            {
                title: "Capabilities",
                url: Paths.capabilities
            },
            {
                title: "General",
                url: "/settings",
            },
            {
                title: "D4H Access Keys",
                url: "/profile/d4h-access-keys",
            },
            {
                title: "People",
                url: Paths.people,
            },
            {
                title: "Skills",
                url: Paths.skills
            },
            {
                title: "Skill Groups",
                url: Paths.skillGroups
            },
            {
                title: "Teams",
                url: Paths.teams,
            },
            {
                title: "Who am I?",
                url: Paths.whoami
            },
        ],
    },
    { 
        title: "Source Code",
        url: "https://github.com/alexwestphal/rtplus-vercel",
        icon: <Image
            aria-hidden
            src="/github.svg"
            alt="Githib Icon"
            width={16}
            height={16}
        />
    }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="mt-2">
            <Link href="/dashboard">
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={150}
                    height={75}
                    priority
                />
            </Link>
        </SidebarHeader>
        <SidebarContent>
            <NavSection title="Tools" items={navTools} />
            <NavSection title="General" items={navGeneral}/>
        </SidebarContent>
        <SidebarRail />
    </Sidebar>
}
