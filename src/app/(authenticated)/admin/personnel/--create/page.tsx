/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/personnel/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { AdminModule_NewPerson_Form } from './new-person'


export default async function AdminModule_NewPerson_Page() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule, 
                Paths.adminModule.personnel,
                Paths.adminModule.personnel.create
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create New Person</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModule_NewPerson_Form/>
            </Boundary>
        </AppPageContent>
        
    </AppPage>
 }