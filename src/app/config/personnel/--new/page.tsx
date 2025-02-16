/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/personnel/--new
 */

import { Metadata } from 'next'

import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { CreatePersonForm } from './create-person-form'



export const metadata: Metadata = { title: "New Person" }

export default async function NewPersonPage() {
    return <AppPage
        label="New Person" 
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index }, 
            { label: "Personnel", href: Paths.config.personnel.index }
        ]}
    >
        <PageHeader>
            <PageTitle>New Person</PageTitle>
            <PageDescription>Add a person to RT+.</PageDescription>
        </PageHeader>
        <CreatePersonForm/>
    </AppPage>
}
