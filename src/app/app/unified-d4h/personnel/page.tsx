/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/unified-d4h/personnel
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'
import { UnifiedD4h_Personnel_ListCard } from './unified-d4h-personnel-list'
import { Boundary } from '@/components/boundary'


export const metadata: Metadata = { title: "Personnel - Unified D4H" }

export default async function PersonnelPage() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.unifiedD4h,
                Paths.unifiedD4h.personnel
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <Boundary>
                 <UnifiedD4h_Personnel_ListCard/>
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}