/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/skill-packages/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { HydrateClient } from '@/trpc/server'


export default async function CreatePersonPage() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
                "Create"
            ]}
        />
        <HydrateClient>
             <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Create New Skill Package</PageTitle>
                </PageHeader>

                <Boundary>
                    TODO Implement
                </Boundary>
            </AppPageContent>
        </HydrateClient>
       
    </AppPage>
 }