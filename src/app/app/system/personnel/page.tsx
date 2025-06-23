/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { PersonnelListCard } from './personnel-list' 


export const metadata: Metadata = { title: "Personnel" }


export default async function PersonnelPage() {
    prefetch(trpc.personnel.all.queryOptions())

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.system, 
                Paths.system.personnel
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Personnel</PageTitle>
                </PageHeader>
                <PersonnelListCard/>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}