/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/scratch
 */



import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { ScratchComponent } from './scratch-component'



export default async function ScratchPage() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                "Scratch"
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Scratch</PageTitle>
            </PageHeader>

            <Boundary>
                <ScratchComponent/>
            </Boundary>
        </AppPageContent>
            
    </AppPage>
}