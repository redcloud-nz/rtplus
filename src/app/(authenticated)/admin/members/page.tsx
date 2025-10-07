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
import { fetchAllTeamSlugsCached, getTeamFromParams } from '@/server/data/team'

import { Team_MembersList_Card } from './team-members-list'


export const metadata = { title: `Team Members` }

export const revalidate = 600 // 10 minutes

export async function generateStaticParams() {
    const orgSlugs = await fetchAllTeamSlugsCached()
    return orgSlugs.map(org_slug => ({ org_slug }))
}

export default async function Team_MembersList_Page(props: PageProps<'/admin/members'>) {
    const team = await getTeamFromParams(props.params)

    const teamMemberTagsEnabled = await teamMemberTagsEnabledFlag()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(team),
                Paths.org(team).members
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Team Members</PageTitle>
            </PageHeader>

            <Boundary>
                <Team_MembersList_Card team={team} showTags={teamMemberTagsEnabled}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}