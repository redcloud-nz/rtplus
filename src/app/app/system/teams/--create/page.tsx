/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { NewTeamDetailsCard } from './new-team-details'

export default async function CreateTeamPage() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.teams,
                "Create"
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create New Team</PageTitle>
            </PageHeader>

            <Boundary>
                <NewTeamDetailsCard/>
            </Boundary>
        </AppPageContent>
    </AppPage>
 }