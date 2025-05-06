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

import { PersonnelList } from './personnel-list' 


export const metadata: Metadata = { title: "Personnel" }

export default async function PersonnelListPage() {

    return <AppPage>
        <AppPageBreadcrumbs 
            label="Personnel" 
            breadcrumbs={[{ label: "System", href: Paths.system.index }]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <PersonnelList/>
        </AppPageContent>
    </AppPage>
}