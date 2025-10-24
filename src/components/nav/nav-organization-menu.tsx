/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { Show } from '@/components/show'
import { AdminModuleIcon, D4HModuleIcon, DashboardIcon, SkillsModuleIcon } from '@/components/icons'
import { SidebarMenu } from '@/components/ui/sidebar'

import * as Paths from '@/paths'
import { getOrganization, isModuleEnabled } from '@/server/organization'

import { NavCollapsible, NavItem, NavSubItem } from './nav-section'


export async function NavOrganizationMenu({ orgSlug }: { orgSlug: string }) {
    const organization = await getOrganization(orgSlug)

    const prefix = Paths.org(organization.slug)

    return <SidebarMenu>
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
}