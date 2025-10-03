/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { Team_Skills_List } from './team-skill-package-list'

export const metadata = { title: 'Skills' }


export default async function Team_Skills_Catalogue_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).skills,
                Paths.team(team).skills.catalogue
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <Team_Skills_List teamId={team.teamId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}