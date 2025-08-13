/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { BookOpenIcon, CableIcon, InfoIcon, LayoutDashboardIcon, PocketKnifeIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Protect } from '@clerk/nextjs'

import { auth } from '@clerk/nextjs/server'

import { NavCollapsible, NavItem, NavSection, NavSubItem } from '@/components/nav/nav-section'

import * as Paths from '@/paths'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '../ui/sidebar'
import { NavUser } from './nav-user'

import { NavOrganization } from './nav-organization'

export type AppSidebarProps = ComponentProps<typeof Sidebar>

export async function AppSidebar({ ...props }: AppSidebarProps) {
    const { orgSlug: teamSlug, sessionClaims } = await auth()
    
    const isSystemAdmin = sessionClaims?.rt_system_role == 'admin'

    return <Sidebar {...props}>
        <SidebarHeader className="flex items-center justify-center">
            <Link href={Paths.selectTeam.index}>
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
                ? <NavSection>
                    <NavOrganization />
                    <NavCollapsible label="Competencies" icon={<PocketKnifeIcon/>}>
                        <NavSubItem path={Paths.team(teamSlug).competencies.checks}/>
                        <NavSubItem path={Paths.team(teamSlug).competencies.checks.create}/>
                        <NavSubItem path={Paths.team(teamSlug).competencies.sessions}/>
                        <NavSubItem path={Paths.competencies.sessions}/>
                        <NavSubItem label="Reports" href={Paths.team(teamSlug).competencies.reports.index}/>
                    </NavCollapsible>
                    <NavItem path={Paths.team(teamSlug).members} icon={<UsersIcon/>}/>
                    <Protect role="org:admin">
                        <NavCollapsible label="Admin" icon={<SettingsIcon/>}>
                            <NavSubItem path={Paths.team(teamSlug).users}/>
                            <NavSubItem path={Paths.team(teamSlug).invitations}/>
                        </NavCollapsible>
                    </Protect>
                    
                </NavSection> 
                : null
            }
            <NavSection title="General">
                <NavItem label="About" href="/about" icon={<InfoIcon/>}/>
                <NavItem label="Documentation" href="https://github.com/redcloud-nz/rtplus/wiki" icon={<BookOpenIcon/>}/>
               
                <NavItem label="Source Code" href="https://github.com/redcloud-nz/rtplus" icon={<Image aria-hidden src="/github.svg" alt="Githib Icon" width={16} height={16}/>}/>
                { isSystemAdmin ? <NavCollapsible label="System" icon={<SettingsIcon/>}>
                    <NavSubItem path={Paths.system.personnel}/>
                    <NavSubItem path={Paths.system.skillPackages}/>
                    <NavSubItem path={Paths.system.teams}/>
                </NavCollapsible> : null }
                 <NavCollapsible label="D4H" icon={<CableIcon/>}>
                    <NavSubItem path={Paths.d4h.activities}/>
                    <NavSubItem path={Paths.d4h.calendar}/>
                    <NavSubItem path={Paths.d4h.equipment}/>
                    <NavSubItem path={Paths.d4h.personnel}/>
                </NavCollapsible>
            </NavSection>
        </SidebarContent>
        <SidebarFooter>
            <NavUser/>
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
}
