/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import Image from 'next/image'
import { Suspense } from 'react'

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'

import { D4HModuleIcon, AdminModuleIcon, SkillsModuleIcon } from '@/components/icons'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarRail } from '@/components/ui/sidebar'

import * as Paths from '@/paths'
import { getOrganization, isModuleEnabled } from '@/server/organization'

import { DashboardIcon } from '../icons'

import { NavCollapsible, NavItem, NavSubItem } from './nav-section'
import { NavSkeleton } from './nav-skeleton'
import { Show } from '../show'


export function AppSidebar({ orgSlug }: { orgSlug: string }) {
    return <Sidebar>
        <SidebarHeader className="flex items-center justify-between">
            <Image
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={48}
                    height={24}
                    priority
                />
            {/* <Link href={Paths.dashboard.href} className="h-full flex items-center p-2 gap-1 italic text-gray-600">
                
                { moduleName && <div className="text-xl pt-1">{moduleName}</div> }
            </Link> */}
            <div className="flex items-center gap-2 p-2">
                <UserButton/>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <div className="h-10 flex items-center">
                <OrganizationSwitcher
                    appearance={{
                        elements: {
                            organizationSwitcherTrigger: 'w-[var(--sidebar-internal-width)] py-2',
                        }
                    }}
                    hidePersonal
                />
            </div>
            <Suspense fallback={<NavSkeleton/>}>
                <AppSidebarContents orgSlug={orgSlug} />
            </Suspense>
        </SidebarContent>
        <SidebarFooter>
            <AppVersion/>
        </SidebarFooter>
        <SidebarRail side="left" />
    </Sidebar>
}

function AppVersion() {
    return <div className="text-xs text-center text-muted-foreground py-1">
        RT+ v{process.env.NEXT_PUBLIC_APP_VERSION} ({process.env.NEXT_PUBLIC_APP_VERSION_NAME})
    </div>
}


async function AppSidebarContents({ orgSlug }: { orgSlug: string }) {

    const organization = await getOrganization(orgSlug)

    const prefix = Paths.org(organization.slug)

    return <>
        <SidebarGroup>
            <SidebarGroupLabel>Org</SidebarGroupLabel>
            <SidebarMenu>
                <NavItem path={prefix.dashboard} icon={<DashboardIcon/>} />
                <NavCollapsible label="Admin" icon={<AdminModuleIcon/>}>
                    <NavSubItem path={prefix.admin.personnel}/>
                    <NavSubItem path={prefix.admin.settings}/>
                    <NavSubItem path={prefix.admin.skillPackages}/>
                    <NavSubItem path={prefix.admin.teams}/>
                </NavCollapsible>
                <Show when={isModuleEnabled(organization, 'd4h')}>
                    <NavCollapsible label="D4H" icon={<D4HModuleIcon/>}>
                        <NavItem path={prefix.d4h.activities}/>
                        <NavItem path={prefix.d4h.calendar}/>
                        <NavItem path={prefix.d4h.equipment}/>
                        <NavItem path={prefix.d4h.personnel}/>
                    </NavCollapsible>
                </Show>
                <Show when={isModuleEnabled(organization, 'skills')}>
                    <NavCollapsible label="Skills" icon={<SkillsModuleIcon/>}>
                        <NavItem path={prefix.skills.catalogue}/>
                        <NavItem path={prefix.skills.checks}/>
                        <NavItem path={prefix.skills.sessions}/>
                        <NavItem path={prefix.skills.reports}/>
                    </NavCollapsible>
                </Show>
            </SidebarMenu>
        </SidebarGroup>
    </>
}