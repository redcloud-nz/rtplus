/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /dashboard
 */

import * as Paths from '@/paths'
import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'


export const metadata = { title: 'Dashboard' }

export default async function Dashboard_Page() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[Paths.dashboard]}/>
        <NotImplemented ghIssueNumber={11}/>
    </AppPage>
}