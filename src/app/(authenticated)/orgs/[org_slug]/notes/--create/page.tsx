/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 * /orgs/[org_slug]/notes/--create
*/

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Show } from '@/components/show'
import { NotImplemented } from '@/components/nav/errors'

import { notesEnabledFlag } from '@/lib/flags'
import * as Paths from '@/paths'

import { NotesModule_NewNote_Form } from './new-note'



export const metadata = {
    title: 'Create - Team Notes',
}

export default async function NotesModule_NewNote_Page(props: PageProps<'/orgs/[org_slug]/notes/--create'>) {
    const { org_slug: orgSlug } = await props.params

    const notesEnabled = await notesEnabledFlag()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).notes,
            Paths.org(orgSlug).notes.create
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
                    <NotesModule_NewNote_Form/>
                </Boundary>
            </AppPageContent>
        </Show>        
    </AppPage>
}

