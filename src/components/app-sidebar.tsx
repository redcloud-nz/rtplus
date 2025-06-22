/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { BookOpenIcon, InfoIcon, LayoutDashboardIcon, PocketKnifeIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { auth } from '@clerk/nextjs/server'

import { NavCollapsible, NavItem, NavSection, NavSubItem } from '@/components/nav-section'

import * as Paths from '@/paths'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from './ui/sidebar'
import { NavUser } from './nav-user'

export type AppSidebarProps = React.ComponentProps<typeof Sidebar>

export async function AppSidebar({ children, ...props }: AppSidebarProps) {
    const { orgSlug: teamSlug, sessionClaims } = await auth()
    
    const isSystemAdmin = sessionClaims?.rt_system_role == 'admin'

    return <Sidebar {...props}>
        <SidebarHeader className="flex items-center justify-center">
            <Link href="/">
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={64}
                    height={32}
                    priority
                />
            </Link>
        </SidebarHeader>
        {/* <div className="h-10 flex justify-center items-center">
            <OrganizationSwitcher
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        organizationSwitcherTrigger: "w-full py-2.5",
                    }
                }}
            />
        </div> */}
        
        <SidebarContent>
            { teamSlug != null 
                ?<NavSection title="Team">
                    <NavItem label="Dashboard" href={Paths.team(teamSlug).index} icon={<LayoutDashboardIcon/>}/>
                    <NavCollapsible label="Competencies" icon={<PocketKnifeIcon/>}>
                        <NavSubItem path={Paths.team(teamSlug).competencies}/>
                        <NavSubItem label="Record" href={Paths.team(teamSlug).competencies.record}/>
                        <NavSubItem label="Sessions" href={Paths.team(teamSlug).competencies.sessionList}/>
                        <NavSubItem label="Reports" href={Paths.team(teamSlug).competencies.reportsList}/>
                    </NavCollapsible>
                    <NavItem path={Paths.team(teamSlug).members} icon={<UsersIcon/>}/>
                    <NavCollapsible label="Settings" icon={<SettingsIcon/>}>
                        <NavSubItem path={Paths.team(teamSlug).users}/>
                        <NavSubItem path={Paths.team(teamSlug).invitations}/>
                    </NavCollapsible>
                </NavSection> 
                : null
            }
            <NavSection title="General">
                <NavItem label="About" href="/about" icon={<InfoIcon/>}/>
                <NavItem label="Documentation" href="https://github.com/redcloud-nz/rtplus/wiki" icon={<BookOpenIcon/>}/>
                <NavItem label="Source Code" href="https://github.com/redcloud-nz/rtplus" icon={<Image aria-hidden src="/github.svg" alt="Githib Icon" width={16} height={16}/>}/>
            </NavSection>
            { isSystemAdmin ? <NavSection title="System">
                    <NavSubItem path={Paths.system.personnel}/>
                    <NavSubItem path={Paths.system.skillPackages}/>
                    <NavSubItem path={Paths.system.teams}/>
                </NavSection> : null }
        </SidebarContent>
        <SidebarFooter>
            <NavUser/>
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
}
