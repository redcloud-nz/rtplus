/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /sytem/teams/[team_id]
 */

import { EllipsisVerticalIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import {  DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'

import { validateNanoid8 } from '@/lib/id'
import * as Paths from '@/paths'
import prisma from '@/server/prisma'
import { HydrateClient } from '@/trpc/server'

import { TeamDetailsCard } from './team-details'
import { TeamMembersCard } from './team-members'
import { TeamMenu } from './team-menu'




interface TeamPageProps {
    params: Promise<{ team_id: string }>
}

const getTeam = cache(async (teamId: string) => prisma.team.findUnique({ where: { id: teamId }}))


export async function generateMetadata({ params }: TeamPageProps) {
    const { team_id: teamId } = await params
    
    const team = await getTeam(teamId)
    if(!team ) notFound()

    return { title: `${team.name} | Teams` }
}


export default async function TeamPage(props: TeamPageProps) {
    const { team_id: teamId } = await props.params
    if(!validateNanoid8(teamId)) return notFound()

    const team = await getTeam(teamId)
    if(!team) notFound()

    return <AppPage>
        <AppPageBreadcrumbs
            label={team.shortName || team.name}
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Teams", href: Paths.system.teams.index }
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Team">{team.name}</PageTitle>
                    <PageControls>
                        <TeamMenu 
                            teamId={teamId} 
                            trigger={<DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="Person options">
                                <EllipsisVerticalIcon/>
                            </DropdownMenuTriggerButton>}
                            />
                    </PageControls>
                </PageHeader>
                
                <TeamDetailsCard teamId={teamId}/>
                <TeamMembersCard teamId={teamId}/>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}



