/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/skills/skill-checks/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { Team_Skill_NewCheck_Card } from './team-new-check'


export const metadata = { title: 'Create Skill Check' }

export default async function Team_Skills_NewCheck_Page(props: PageProps<'/teams/[team_slug]/skills/checks/--create'>) {
   const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.tools.skillRecorder,
                Paths.tools.skillRecorder.single
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <Team_Skill_NewCheck_Card team={team}/> 
            </Boundary>
        </AppPageContent>
    </AppPage>
}


