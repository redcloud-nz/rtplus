/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/personnel
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { AdminModule_PersonnelList } from './personnel-list' 


export const metadata: Metadata = { title: "Personnel" }


export default async function AdminModule_PersonnelList_Page() {

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.adminModule, 
                Paths.adminModule.personnel
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <Boundary>
                <AdminModule_PersonnelList/>
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}