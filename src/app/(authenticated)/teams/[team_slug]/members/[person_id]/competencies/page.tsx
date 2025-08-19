/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/members/[person_id]
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Team_Member_Competencies_Card } from '@/components/cards/team-member-competencies'

import * as Paths from '@/paths'
import { fetchTeamMember } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'


export async function generateMetadata(props: { params: Promise<{ team_slug: string, person_id: string }> }): Promise<Metadata> {
    const teamMember = await fetchTeamMember(props.params)

    return { title: `${teamMember.person.name}` }
}


export default async function Team_Member_Competencies_Page(props: { params: Promise<{ team_slug: string, person_id: string }>}) {
    const { person, team } = await fetchTeamMember(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).members,
                Paths.team(team).member(person),
                Paths.team(team).member(person.personId).competencies
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Team Member">{person.name}</PageTitle>
                </PageHeader>
                <Boundary>
                    <Team_Member_Competencies_Card personId={person.personId}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}