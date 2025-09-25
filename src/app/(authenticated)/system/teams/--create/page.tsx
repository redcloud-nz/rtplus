/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/teams/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { System_NewTeam_Details_Card } from './system-new-team-details'


export default async function System_NewTeam_Page() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.teams,
                Paths.system.teams.create
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create New Team</PageTitle>
            </PageHeader>

            <Boundary>
                <System_NewTeam_Details_Card/>
            </Boundary>
        </AppPageContent>
       
    </AppPage>
 }