/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/members
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { teamMemberTagsEnabledFlag } from '@/lib/flags'
import * as Paths from '@/paths'
import { fetchTeam } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { Team_MembersList_Card } from './team-members-list'


export const metadata = { title: `Team Members` }


export default async function Team_MembersList_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeam(props.params)

    const teamMemberTagsEnabled = await teamMemberTagsEnabledFlag()

    prefetch(trpc.activeTeam.members.getTeamMembers.queryOptions({}))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).members
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Team Members</PageTitle>
                </PageHeader>

                <Boundary>
                    <Team_MembersList_Card showTags={teamMemberTagsEnabled}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
            
    </AppPage>
}