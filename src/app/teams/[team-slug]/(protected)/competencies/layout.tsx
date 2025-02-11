/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team-slug]/competencies
 */

import { LayoutDashboardIcon, ListPlusIcon, ScrollIcon, Settings2Icon, SquarePenIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavCollapsible, NavItem, NavSection, NavSubItem } from '@/components/nav-section'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: {
        template: "%s | Competencies | RT+",
        default: "Competencies | RT+",
    },
    description: "RT+ Competency management and tracking",
};

export default async function CompetenciesLayout(props: { children: React.ReactNode, params: Promise<TeamParams> }) {
    const { 'team-slug': teamSlug } = await props.params

    return <>
        <AppSidebar>
            <NavSection title="Competencies">
                <NavItem label="Dashboard" href={Paths.team(teamSlug).competencies.dashboard} icon={<LayoutDashboardIcon/>}/>
                <NavItem label="Record" href={Paths.team(teamSlug).competencies.record} icon={<SquarePenIcon/>}/>
                <NavItem label="Sessions" href={Paths.team(teamSlug).competencies.sessionList} icon={<ListPlusIcon/>}/>
                <NavItem label="Reports" href={Paths.team(teamSlug).competencies.reportsList} icon={<ScrollIcon/>}/>
                <NavCollapsible label="Configuration" icon={<Settings2Icon/>}>
                    <NavSubItem label="Personnel" href={Paths.personnel}/>
                    <NavSubItem label="Skills" href={Paths.skillsList}/>
                    <NavSubItem label="Skill Groups" href={Paths.skillGroupsList}/>
                    <NavSubItem label="Skill Packages" href={Paths.skillPackagesList}/>
                    <NavSubItem label="Teams" href={Paths.teams.list}/>
                </NavCollapsible>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {props.children}
        </AppPageContainer>
    </>
}
