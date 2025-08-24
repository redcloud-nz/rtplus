/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'

export const metadata = { title: 'Personal Note' }

export default async function Personal_Notes_Page({ params }: { params: Promise<{ note_id: string }> }) {

    const { note_id: noteId } = await params

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.personal, 
            Paths.personal.notes,
            Paths.personal.note(noteId)
        ]}/>
        <NotImplemented ghIssueNumber={24}/>
    </AppPage>
}

