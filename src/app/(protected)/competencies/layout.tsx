/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies
 */

import { LayoutDashboardIcon, ListPlusIcon, PencilIcon, ScrollIcon, Settings2Icon, SquarePenIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavCollapsible, NavItem, NavSection, NavSubItem } from '@/components/nav-section'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: "RT+ Competencies",
    description: "RT+ Competency management and tracking",
};

export default async function CompetenciesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="Competencies">
                <NavItem label="Dashboard" href={Paths.competencies.dashboard} icon={<LayoutDashboardIcon/>}/>
                <NavItem label="Record" href={Paths.competencies.record} icon={<SquarePenIcon/>}/>
                <NavItem label="Sessions" href={Paths.competencies.sessionList} icon={<ListPlusIcon/>}/>
                <NavItem label="Reports" href={Paths.competencies.reportsList} icon={<ScrollIcon/>}/>
                <NavCollapsible label="Configuration" icon={<Settings2Icon/>}>
                    <NavSubItem label="Personnel" href={Paths.personnel}/>
                    <NavSubItem label="Skills" href={Paths.skillsList}/>
                    <NavSubItem label="Skill Groups" href={Paths.skillGroupsList}/>
                    <NavSubItem label="Skill Packages" href={Paths.skillPackagesList}/>
                    <NavSubItem label="Teams" href={Paths.teams}/>
                </NavCollapsible>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}
