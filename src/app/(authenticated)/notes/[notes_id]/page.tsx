/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'
import { getTeamFromParams } from '@/server/data/team'

export const metadata = { title: 'Team Note' }

export default async function Team_Notes_Page(props: { params: Promise<{ team_slug: string, note_id: string }> }) {
    const { note_id: noteId } = await props.params
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(team), 
            Paths.org(team).notes,
            Paths.org(team).note(noteId)
        ]}/>
        <NotImplemented ghIssueNumber={25}/>
    </AppPage>
}

