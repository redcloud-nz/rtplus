/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team_slug]/members/[person_id]
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { fetchTeamMembership } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'
import { Boundary } from '@/components/boundary'

import { TeamMemberDetails } from './team-member-details'



export async function generateMetadata(props: { params: Promise<{ team_slug: string, person_id: string }> }): Promise<Metadata> {
    const teamMember = await fetchTeamMembership(props.params)

    return { title: `${teamMember.person.name} - ${teamMember.team.shortName || teamMember.team.name}` }
}


export default async function TeamMemberPage(props: { params: Promise<{ team_slug: string, person_id: string }>}) {
    const { person, team } = await fetchTeamMembership(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                { label: team.shortName || team.name, href: Paths.team(team.slug).index },
                Paths.team(team.slug).members,
                person.name
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Team Member">{person.name}</PageTitle>
                </PageHeader>
                <Boundary>
                    <TeamMemberDetails personId={person.personId} teamId={team.teamId} />
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}