/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'
import { fetchTeam } from '@/server/fetch'

export const metadata = { title: 'Team Note' }

export default async function Team_Notes_Page({ params }: { params: Promise<{ team_slug: string, note_id: string }> }) {
    const team = await fetchTeam(params)
    const { note_id: noteId } = await params

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.team(team), 
            Paths.team(team).notes,
            Paths.team(team).note(noteId)
        ]}/>
        <NotImplemented ghIssueNumber={25}/>
    </AppPage>
}

