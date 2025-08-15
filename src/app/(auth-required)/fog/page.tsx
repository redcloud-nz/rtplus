/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /fog
 */
import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default async function FOGPage() {
    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[Paths.fog]}/>
        <NotImplemented/>
    </AppPage>
}