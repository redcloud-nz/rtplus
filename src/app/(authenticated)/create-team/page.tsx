/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /create-team
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { CreateNewTeam_Card } from './create-new-team'

export const metadata = { title: "Create New Team" }


export default async function CreateNewTeam_Page() { 
    
    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[ Paths.createTeam ]} />
            <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create New Team</PageTitle>
            </PageHeader>

            <Boundary>
                <CreateNewTeam_Card/>
            </Boundary>
        </AppPageContent>
    </AppPage>
 }