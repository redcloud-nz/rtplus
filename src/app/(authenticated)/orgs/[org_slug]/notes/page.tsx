/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/notes
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'

export const metadata = { title: 'Notes' }

export default async function NotesModule_Index_Page(props: PageProps<'/orgs/[org_slug]/notes'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).notes
        ]}/>
        <NotImplemented ghIssueNumber={25}/>
    </AppPage>
}

