/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 * /orgs/[org_slug]/notes/--create
*/

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { NotesModule_NewNote_Form } from './new-note'
import { getOrganization } from '@/server/organization'



export const metadata = {
    title: 'Create - Team Notes',
}

export default async function NotesModule_NewNote_Page(props: PageProps<'/orgs/[org_slug]/notes/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)


    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).notes,
            Paths.org(orgSlug).notes.create
        ]}/>
        <AppPageContent variant="container">
            <NotesModule_NewNote_Form organization={organization} />
        </AppPageContent>       
    </AppPage>
}

