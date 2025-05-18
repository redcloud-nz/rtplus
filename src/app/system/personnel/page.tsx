/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel
 */

import { Metadata } from 'next'
import React from 'react'


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { PersonnelListCard } from './personnel-list-card' 


export const metadata: Metadata = { title: "Personnel" }

export default async function PersonnelListPage() {
    prefetch(trpc.personnel.all.queryOptions())

    return <AppPage>
        <AppPageBreadcrumbs 
            label="Personnel" 
            breadcrumbs={[{ label: "System", href: Paths.system.index }]}
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