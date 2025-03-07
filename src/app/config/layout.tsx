/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system
 */

import { BoxesIcon, GroupIcon, ImportIcon, PocketKnifeIcon, SettingsIcon, ShieldHalfIcon, UsersIcon } from 'lucide-react'
import type { Metadata } from 'next'


import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'
import { ServerProtect } from '@/server/protect'


export const metadata: Metadata = {
    title: {
        template: "%s | Configure | RT+",
        default: "Configure",
    },
    description: "RT+ Configuration",
};

export default async function SystemConfigLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="Configuration">
                <NavItem label="General Settings" href="/settings" icon={<SettingsIcon/>}/>
                <ServerProtect permission="system:write">
                    <NavItem label="Imports" href={Paths.imports.index} icon={<ImportIcon/>}/>
                </ServerProtect>
                <NavItem label="Personnel" href={Paths.config.personnel.index} icon={<UsersIcon/>}/>
                <NavItem label="Skills" href={Paths.config.skills.index} icon={<PocketKnifeIcon/>}/>
                <NavItem label="Skill Groups" href={Paths.config.skillGroups.index} icon={<GroupIcon/>}/>
                <NavItem label="Skill Packages" href={Paths.config.skillPackages.index} icon={<BoxesIcon/>}/>
                <NavItem label="Teams" href={Paths.config.teams.index} icon={<ShieldHalfIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}
