/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin
 */

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotFound } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default function AdminModule_NotFound(props: PageProps<'/orgs/[org_slug]/admin'>) {

    return <AppPage>
        
        <NotFound/>
    </AppPage>
}