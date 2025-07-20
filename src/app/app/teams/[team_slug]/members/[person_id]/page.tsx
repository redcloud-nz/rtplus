/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team_slug]/members/[person_id]
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { getTeamMember, TeamMemberParams } from '.'


export async function generateMetadata(props: { params: Promise<TeamMemberParams> }): Promise<Metadata> {
    const teamMember = await getTeamMember(props.params)

    return { title: `${teamMember.person.name} - ${teamMember.team.shortName || teamMember.team.name}` }
}


export default async function TeamMemberPage(props: { params: Promise<TeamMemberParams>}) {
    const { person, team } = await getTeamMember(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                { label: team.shortName || team.name, href: Paths.team(team.slug).index },
                Paths.team(team.slug).members,
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team Member">{person.name}</PageTitle>
            </PageHeader>
        </AppPageContent>
    </AppPage>
}