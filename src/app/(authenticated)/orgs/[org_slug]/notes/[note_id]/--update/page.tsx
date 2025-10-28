/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /org/[org_slug]/notes/[note_id]/--update
*/

'use client'

import { use } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { NotesModule_UpdateNote } from './update-note'




export default function NotesModule_UpdateNote_Page(props: PageProps<'/orgs/[org_slug]/notes/[note_id]/--update'>) {
    const { org_slug: orgSlug, note_id: noteId } = use(props.params)
    
    const organization = useOrganization()
    const { data: note } = useSuspenseQuery(trpc.notes.getNote.queryOptions({ orgId: organization.orgId, noteId }))

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).notes,
            Paths.org(orgSlug).notes.note(noteId).labelled(note.title),
            Paths.org(orgSlug).notes.note(noteId).update
        ]}/>
        <AppPageContent variant="container">
            <NotesModule_UpdateNote note={note} organization={organization}/>
        </AppPageContent>
    </AppPage>
}

