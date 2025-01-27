/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage
 */

import { BoxesIcon, GroupIcon, ImportIcon, PocketKnifeIcon, SettingsIcon, ShieldHalfIcon, UsersIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'
import { Protect } from '@/components/protect'


export const metadata: Metadata = {
    title: "RT+ | Manage",
    description: "RT+ Data Management",
};

export default async function ManageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="Manage">
                <NavItem label="General Settings" href="/settings" icon={<SettingsIcon/>}/>
                <Protect permission="system:write">
                    <NavItem label="Imports" href={Paths.imports.list} icon={<ImportIcon/>}/>
                </Protect>
                <NavItem label="Personnel" href={Paths.personnel} icon={<UsersIcon/>}/>
                <NavItem label="Skills" href={Paths.skillsList} icon={<PocketKnifeIcon/>}/>
                <NavItem label="Skill Groups" href={Paths.skillGroupsList} icon={<GroupIcon/>}/>
                <NavItem label="Skill Packages" href={Paths.skillPackagesList} icon={<BoxesIcon/>}/>
                <NavItem label="Teams" href={Paths.teams.list} icon={<ShieldHalfIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}
