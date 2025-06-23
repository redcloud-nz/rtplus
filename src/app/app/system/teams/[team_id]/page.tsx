/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /sytem/teams/[team_id]
 */

import { EllipsisVerticalIcon } from 'lucide-react'
import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import {  DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'

import * as Paths from '@/paths'
import { HydrateClient } from '@/trpc/server'

import { TeamDetailsCard_sys } from './team-details'
import { TeamMembersCard_sys } from './team-members-list'
import { TeamMenu_sys } from './team-menu'
import { TeamUsersCard_sys } from './team-users-list'

import { getTeam, TeamParams } from '.'



export async function generateMetadata(props: { params: Promise<TeamParams> }): Promise<Metadata> {
    const team = await getTeam(props.params)

    return { title: `${team.name} - Teams` }
}


export default async function TeamPage_sys(props: { params: Promise<TeamParams> }) {
    const team = await getTeam(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.teams,
                team.shortName || team.name
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Team">{team.name}</PageTitle>
                    <PageControls>
                        <TeamMenu_sys 
                            teamId={team.id} 
                            trigger={<DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Person options">
                                <EllipsisVerticalIcon/>
                            </DropdownMenuTriggerButton>}
                            />
                    </PageControls>
                </PageHeader>
                
                <TeamDetailsCard_sys teamId={team.id}/>
                <TeamMembersCard_sys teamId={team.id}/>
                <TeamUsersCard_sys teamId={team.id}/>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}



