/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Show } from '@/components/show'
import { NotImplemented } from '@/components/nav/errors'

import { notesEnabledFlag } from '@/lib/flags'
import * as Paths from '@/paths'

import { fetchTeam } from '@/server/fetch'

import { Team_NewNote_Card } from './team-new-note'



export const metadata = {
    title: 'Create - Team Notes',
}

export default async function Team_NewNote_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeam(props.params)

    const notesEnabled = await notesEnabledFlag()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.team(team),
            Paths.team(team).notes,
            Paths.team(team).notes.create
        ]}/>
        <Show 
            when={notesEnabled}
            fallback={<NotImplemented ghIssueNumber={25} />}
        >
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Create Team Note</PageTitle>
                </PageHeader>
                <Boundary>
                    <Team_NewNote_Card teamId={team.teamId} />
                </Boundary>
            </AppPageContent>
        </Show>        
    </AppPage>
}

