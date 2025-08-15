/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { HydrateClient } from '@/trpc/server'

import { System_NewPerson_Details_Card } from './system-new-person-details'


export default async function System_NewPerson_Page() { 
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system, 
                Paths.system.personnel,
                Paths.system.personnel.create
            ]}
        />
        <HydrateClient>
             <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Create New Person</PageTitle>
                </PageHeader>

                <Boundary>
                    <System_NewPerson_Details_Card/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
       
    </AppPage>
 }