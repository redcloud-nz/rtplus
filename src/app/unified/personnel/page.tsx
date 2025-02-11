/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified/personnel
 */

import { Metadata } from 'next'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { PersonnelList } from './personnel-list'


export const metadata: Metadata = { title: "Personnel" }

export default async function PersonnelPage() {

    return <AppPage 
        label="Personnel" 
        breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}
    >
        <PageTitle>Personnel</PageTitle>
        <PageDescription>
            A list of the personnel available from your configured teams.
        </PageDescription>
        <PersonnelList/>
    </AppPage>
}