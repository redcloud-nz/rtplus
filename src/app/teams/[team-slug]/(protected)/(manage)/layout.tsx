/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage
 */

import { BoxesIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { TeamParams } from '@/app/teams/[team-slug]'
import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: {
        template: "%s | Manage | RT+",
        default: "Manage | RT+",
    },
    description: "RT+ Data Management",
};

export default async function ManageTeamLayout(props: { children: React.ReactNode, params: Promise<TeamParams> }) {
    const { 'team-slug': teamSlug } = await props.params

    return <>
        <AppSidebar>
            <NavSection title="Manage Team">
                <NavItem label="Members" href={Paths.team(teamSlug).members} icon={<BoxesIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {props.children}
        </AppPageContainer>
    </>
}
