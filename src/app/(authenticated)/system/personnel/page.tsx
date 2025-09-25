/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { System_PersonnelList_Card } from './system-personnel-list' 


export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: "Personnel" }


export default async function System_PersonnelList_Page() {

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.system, 
                Paths.system.personnel
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <Boundary>
                <System_PersonnelList_Card/>
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}