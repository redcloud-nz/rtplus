/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/notes
*/

import { AppPageHeader } from '@/components/app-page'
import { SidebarInset } from '@/components/ui/sidebar'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { NotesModule_NotesList } from './notes-list'


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
        <div className="flex flex-1 flex-col items-center gap-4 p-4 xl:*:w-4xl">
            <NotesModule_NotesList organization={organization} />
        </div>
    </SidebarInset>
}

