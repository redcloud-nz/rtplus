/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/notes
*/

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { NotesModule_NotesList } from './notes-list'




export const metadata = { title: 'Notes' }

export default async function NotesModule_Index_Page(props: PageProps<'/orgs/[org_slug]/notes'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).notes
            ]}
        />
        <Lexington.Page variant="container">
            <NotesModule_NotesList organization={organization} />
        </Lexington.Page>
    </Lexington.Root>
}

