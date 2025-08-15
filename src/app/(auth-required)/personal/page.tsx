/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal
 */

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default async function Personal_Index_Page() {
    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[Paths.personal]}/>
        <NotImplemented/>
    </AppPage>
}