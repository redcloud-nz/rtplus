/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/notes
*/

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { NotesModule_NotesList } from './notes-list'


export const metadata = { title: 'Notes' }

export default async function NotesModule_Index_Page(props: PageProps<'/orgs/[org_slug]/notes'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).notes
            ]}
        />
        <AppPageContent variant="container">
            <NotesModule_NotesList organization={organization} />
        </AppPageContent>
    </AppPage>
}

