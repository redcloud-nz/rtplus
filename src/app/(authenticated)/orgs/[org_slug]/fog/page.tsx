/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/fog
 */
import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default async function FOGModule_Page(props: PageProps<'/orgs/[org_slug]/fog'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[Paths.org(orgSlug).fog]}/>
        <NotImplemented/>
    </AppPage>
}