/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/teams/[team_id]
 */

import { notFound } from 'next/navigation'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'


import { validateShortId } from '@/lib/id'
import * as Paths from '@/paths'
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server'

import { TeamDetailsCard } from './team-details-card'
import { TeamMembersCard } from './team-members-card'


interface TeamPageProps {
    params: Promise<{ team_id: string }>
}

export async function generateMetadata({ params }: TeamPageProps) {
    const { team_id: teamId } = await params
    if(!validateShortId(teamId)) return { title: "Team" }

    const queryClient = getQueryClient()
    const team = await queryClient.fetchQuery(trpc.teams.byId.queryOptions({ teamId }))

    if(!team) return { title: "Team" }

    return { title: `${team.name} | Team` }
}


export default async function TeamPage(props: TeamPageProps) {
    const { team_id: teamId } = await props.params
    if(!validateShortId(teamId)) return notFound()

    const queryClient = getQueryClient()
    const team = await queryClient.fetchQuery(trpc.teams.byId.queryOptions({ teamId }))

    if(!team) return notFound()

    return <AppPage>
        <AppPageBreadcrumbs
            label={team.shortName || team.name}
            breadcrumbs={[
                { label: "Configure", href: Paths.system.index }, 
                { label: "Teams", href: Paths.system.teams.index }
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Team">{team.name}</PageTitle>
                    {/* <PageControls>
                        <TeamOptionsMenu
                            teamId={team.id}
                            trigger={<Button variant="ghost"><EllipsisVerticalIcon/></Button>}
                        />
                    </PageControls> */}
                </PageHeader>
                
                <TeamDetailsCard teamId={teamId}/>
                <TeamMembersCard teamId={teamId}/>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}



