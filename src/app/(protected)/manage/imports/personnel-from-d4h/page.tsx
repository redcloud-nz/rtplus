/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /imports/personnel-from-d4h
 */

import React from 'react'

import { AppPage, PageBoundary, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { ImportPersonnel } from './import-personnel'
import { HydrateClient, trpc } from '@/trpc/server'



export default async function ImportPersonnelPage() {   
    void trpc.currentUser.d4hAccessKeys.prefetch()

    return <AppPage
        label="Personnel From D4H"
        breadcrumbs={[
            { label: 'Manage', href: Paths.manage },
            { label: 'Imports', href: Paths.imports.list },
        ]}
    >
        <PageHeader>
            <PageTitle>Import Personnel</PageTitle>
            <PageDescription>Import personnel from D4H.</PageDescription>
        </PageHeader>
        <HydrateClient>
            <PageBoundary>
                <ImportPersonnel/>
            </PageBoundary>
        </HydrateClient>
        <ImportPersonnel/>
    </AppPage>
}

