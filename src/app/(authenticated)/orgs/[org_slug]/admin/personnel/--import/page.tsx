/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/--import
 */

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default async function ImportPersonnel(props: PageProps<'/orgs/[org_slug]/admin/personnel/--import'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.personnel,
                Paths.org(orgSlug).admin.personnel.import
            ]}
        />
        <NotImplemented />
    </AppPage>
}