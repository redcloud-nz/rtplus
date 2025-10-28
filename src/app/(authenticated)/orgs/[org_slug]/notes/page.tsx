/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/notes
*/

import { AppPageHeader } from '@/components/app-page'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { NotesModule_NotesList } from './notes-list'
import { SidebarInset } from '@/components/ui/sidebar'


export const metadata = { title: 'Notes' }

export default async function NotesModule_Index_Page(props: PageProps<'/orgs/[org_slug]/notes'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <SidebarInset>
        <AppPageHeader
            breadcrumbs={[
                Paths.org(orgSlug).notes
            ]}
        />
        <main className="h-[calc(100vh-var(--header-height))] p-4">
            <NotesModule_NotesList organization={organization} />
        </main>
    </SidebarInset>
}

