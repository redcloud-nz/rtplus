
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { BookOpenIcon, InfoIcon, ListChecksIcon, NotebookTextIcon, PocketKnifeIcon, Settings2Icon, SquareTerminalIcon, UserCheckIcon, WalletCardsIcon } from "lucide-react"

import { NavItem, NavSection } from '@/components/nav-section'
import { NavUser } from '@/components/nav-user'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
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
                title: "Dashboard",
                url: Paths.competencies.dashboard
            },
            {
                title: "Assessments",
                url: Paths.competencies.assessmentList
            },
            {
                title: "Reports",
                url: Paths.competencies.reportsList
            }
        ]
    },
    {
        title: "D4H Unified",
        url: "/unified",
        icon: <SquareTerminalIcon/>,
        authRequired: true,
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
        authRequired: true,
        items: [
            {
                title: "General",
                url: "/settings",
            },
            
            {
                title: "Personnel",
                url: Paths.personnel,
            },
            {
                title: "Skills",
                url: Paths.skillsAll
            },
            {
                title: "Skill Groups",
                url: Paths.skillGroupsAll
            },
            {
                title: "Skill Packages",
                url: Paths.skillPackages
            },
            {
                title: "Teams",
                url: Paths.teams,
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

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & { signedIn: boolean }

export function AppSidebar({ signedIn, ...props }: AppSidebarProps) {
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
            <NavSection title="Tools" items={navTools} signedIn={signedIn}/>
            <NavSection title="General" items={navGeneral} signedIn={signedIn}/>
        </SidebarContent>
        <SidebarFooter>
            <NavUser user={{ name: "Alex Westphal", email: "alexwestphal.nz@gmail.com", avatar: "" }}/>
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
}
