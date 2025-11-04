/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Show } from '@/components/show'
import { AdminModuleIcon, D4HModuleIcon, OrgDashboardIcon, NotesModuleIcon, SkillsModuleIcon, SPMModuleIcon } from '@/components/icons'
import { S2_SidebarGroup, S2_SidebarGroupLabel, S2_SidebarMenu } from '@/components/ui/s2-sidebar'

import { useOrganization } from '@/hooks/use-organization'
import { isModuleEnabled } from '@/lib/modules'
import * as Paths from '@/paths'

import { NavCollapsible, NavItem, NavSubItem } from './nav-section'



export function NavOrganizationMenu() {
    const organization = useOrganization()

    const orgPrefix = Paths.org(organization.slug)

    return <S2_SidebarGroup>
        <S2_SidebarMenu>
            <NavItem path={orgPrefix.dashboard} icon={<OrgDashboardIcon/>}/>
            <NavCollapsible label="Admin" icon={<AdminModuleIcon/>} prefix={orgPrefix.admin.href}>
                <NavSubItem path={orgPrefix.admin.profile}/>
                <NavSubItem path={orgPrefix.admin.personnel}/>
                <NavSubItem path={orgPrefix.admin.settings}/>
                {/* <NavSubItem path={prefix.admin.skillPackages}/> */}
                <NavSubItem path={orgPrefix.admin.teams}/>
            </NavCollapsible>
            <Show when={isModuleEnabled(organization, 'd4h-views')}>
                <NavCollapsible label="D4H" icon={<D4HModuleIcon/>} prefix={orgPrefix.d4hViews.href}>
                    <NavItem path={orgPrefix.d4hViews.activities}/>
                    <NavItem path={orgPrefix.d4hViews.calendar}/>
                    <NavItem path={orgPrefix.d4hViews.equipment}/>
                    <NavItem path={orgPrefix.d4hViews.personnel}/>
                </NavCollapsible>
            </Show>
            <Show when={isModuleEnabled(organization, 'notes')}>
                <NavCollapsible label="Notes" icon={<NotesModuleIcon/>} prefix={orgPrefix.notes.href}>
                    <NavItem path={orgPrefix.notes}/>
                </NavCollapsible>
            </Show>
            <Show when={isModuleEnabled(organization, 'skill-package-manager')}>
                <NavCollapsible label="Skill Package Manager" icon={<SPMModuleIcon/>} prefix={orgPrefix.spm.href}>
                    <NavItem path={orgPrefix.spm.skillPackages}/>
                </NavCollapsible>
            </Show>
            <Show when={isModuleEnabled(organization, 'skills')}>
                <NavCollapsible label="Skills" icon={<SkillsModuleIcon/>} prefix={orgPrefix.skills.href}>
                    <NavItem path={orgPrefix.skills.catalogue}/>
                    <NavItem path={orgPrefix.skills.checks}/>
                    <NavItem path={orgPrefix.skills.sessions}/>
                    <NavItem path={orgPrefix.skills.reports}/>
                </NavCollapsible>
            </Show>
        </S2_SidebarMenu>
    </S2_SidebarGroup>
    
}