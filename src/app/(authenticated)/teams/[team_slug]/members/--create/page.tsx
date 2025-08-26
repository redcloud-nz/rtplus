/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/members/--create
 * 
 */

import React from 'react'


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import { teamMemberTagsEnabledFlag } from '@/lib/flags'
import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { Team_NewMember_Details_Card } from './new-member-details'



export const metadata = { title: `New Team Member` }

export default async function Team_NewMember_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    const teamMemberTagsEnabled = await teamMemberTagsEnabledFlag()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).members,
                Paths.team(team).members.create
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>New Team Member</PageTitle>
            </PageHeader>

            <Boundary>
                <Team_NewMember_Details_Card team={team} showTags={teamMemberTagsEnabled} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}