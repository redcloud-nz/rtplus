/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /org/[org_slug]/notes/[note_id]/history
*/

'use client'

import { use } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'
import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export default function NotesModule_NoteHistory_Page(props: PageProps<'/orgs/[org_slug]/notes/[note_id]/history'>) {
    const { org_slug: orgSlug, note_id: noteId } = use(props.params)

    const organization = useOrganization()
    const { data: note } = useSuspenseQuery(trpc.notes.getNote.queryOptions({ orgId: organization.orgId, noteId }))

    const notesModule = Paths.org(orgSlug).notes

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            notesModule,
            notesModule.note(noteId).labelled(note.title),
            notesModule.note(noteId).history
        ]}/>
        <AppPageContent variant="centered">
            <NotImplemented />
        </AppPageContent>
    </AppPage>
}

