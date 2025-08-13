/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/d4h/personnel
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { D4hPersonnelList_Card } from './d4h-personnel-list'


export const metadata: Metadata = { title: "Personnel - D4H" }

export default async function D4HPersonnel_Page() {
    const { sessionClaims: { rt_person_id: personId } } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.d4h,
                Paths.d4h.personnel
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <Boundary>
                 <D4hPersonnelList_Card personId={personId} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}