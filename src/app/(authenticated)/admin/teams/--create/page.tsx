/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/teams/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { AdminModile_NewTeam_Form } from './new-team'


export default async function AdminModule_NewTeam_Page() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule, 
                Paths.adminModule.teams,
                Paths.adminModule.teams.create
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create New Team</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModile_NewTeam_Form/>
            </Boundary>
        </AppPageContent>
       
    </AppPage>
 }