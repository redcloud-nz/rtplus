/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/imports
 */

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { GridList, GridListItem } from '@/components/ui/grid-list'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

export default function ImportsPage() {

    return <AppPage
        label="Imports"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
        <PageHeader>
            <PageTitle>Import</PageTitle>
            <PageDescription>Various ways to import data into RT+.</PageDescription>
        </PageHeader>
       <GridList className="mt-4">
            <GridListItem asChild>
                <Link href="/manage/imports/personnel">
                    <div className="flex items-center space-x-3">
                        <h3 className="truncate text-sm font-medium text-gray-900">Import Personnel from D4H</h3>
                    </div>
                </Link>
            </GridListItem>
            <GridListItem asChild>
                <Link href="/manage/imports/skill-package">
                    <div className="foex items-center space-x-3">
                        <h3 className="truncate text-sm font-medium text-gray-900">Import Skill Package</h3>
                    </div>

                </Link>
            </GridListItem>
       </GridList>
    </AppPage>
}