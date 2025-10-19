/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /notes/[note_id]
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'

export const metadata = { title: 'Team Note' }

export default async function NotesModule_Note_Page(props: PageProps<'/notes/[note_id]'>) {
    const { note_id: noteId } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.notesModule,
            Paths.notesModule.note(noteId)
        ]}/>
        <NotImplemented ghIssueNumber={25}/>
    </AppPage>
}

