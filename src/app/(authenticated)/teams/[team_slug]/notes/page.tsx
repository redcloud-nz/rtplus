/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'
import { getTeamFromParams } from '@/server/data/team'

export const metadata = { title: 'Team Notes' }

export default async function Team_NotesList_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.team(team), 
            Paths.team(team).notes
        ]}/>
        <NotImplemented ghIssueNumber={25}/>
    </AppPage>
}

