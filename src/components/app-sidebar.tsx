
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { BookOpenIcon, InfoIcon, ListChecksIcon, NotebookTextIcon, PocketKnifeIcon, Settings2Icon, UserCheckIcon, WalletCardsIcon } from "lucide-react"

import { NavCollapsible, NavItem, NavSection, NavSubItem } from '@/components/nav-section'
import { NavUser } from '@/components/nav-user'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import * as Paths from '@/paths'
import { Protect } from '@clerk/nextjs'


export type AppSidebarProps = React.ComponentProps<typeof Sidebar>

export function AppSidebar({ ...props }: AppSidebarProps) {
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
            <NavSection title="Tools">
                <Protect>
                    <NavItem label="Availability" href="/availability" icon={<UserCheckIcon/>}/>
                    <NavItem label="Checklists" href="/checklists" icon={<ListChecksIcon/>}/>
                    <NavCollapsible label="Competencies" icon={<PocketKnifeIcon/>}>
                        <NavSubItem label="Dashboard" href={Paths.competencies.dashboard}/>
                        <NavSubItem label="Assessments" href={Paths.competencies.assessmentList}/>
                        <NavSubItem label="Reports" href={Paths.competencies.reportsList}/>
                    </NavCollapsible>
                </Protect>
                <NavItem label="Field Operations Guide" href="/fog" icon={<NotebookTextIcon/>}/>
                <NavItem label="Reference Card" href="/cards" icon={<WalletCardsIcon/>}/>
            </NavSection>
            <NavSection title="General">
                <NavItem label="About" href="/about" icon={<InfoIcon/>}/>
                <NavItem label="Documentation" href="/documentation" icon={<BookOpenIcon/>}/>
                <Protect role='org:admin'>
                    <NavCollapsible label="Configuration" icon={<Settings2Icon/>}>
                        <NavSubItem label="General" href="/settings"/>
                        <NavSubItem label="Personnel" href={Paths.personnel}/>
                        <NavSubItem label="Skills" href={Paths.skillsAll}/>
                        <NavSubItem label="Skill Groups" href={Paths.skillGroupsAll}/>
                        <NavSubItem label="Skill Packages" href={Paths.skillPackages}/>
                        <NavSubItem label="Teams" href={Paths.teams}/>
                    </NavCollapsible>
                </Protect>
                <NavItem label="Source Code" href="https://github.com/redcloud-nz/rtplus" icon={<Image aria-hidden src="/github.svg" alt="Githib Icon" width={16} height={16}/>}/>
            </NavSection>
        </SidebarContent>
        <SidebarFooter>
            <NavUser user={{ name: "Alex Westphal", email: "alexwestphal.nz@gmail.com", avatar: "" }}/>
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
}
