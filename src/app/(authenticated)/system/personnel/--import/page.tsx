/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default function ImportPersonnel() {


    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.system,
                Paths.system.personnel,
                Paths.system.personnel.import
            ]} />
        <NotImplemented />
    </AppPage>
}