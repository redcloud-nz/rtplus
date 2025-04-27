/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/personnel
 */

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'

import * as Paths from '@/paths'

import { CreatePersonDialog } from './create-person-dialog'
import { PersonnelList } from './personnel-list' 


export const metadata: Metadata = { title: "Personnel" }

export default async function PersonnelListPage() {

    return <AppPage>
        <AppPageBreadcrumbs 
            label="Personnel" 
            breadcrumbs={[{ label: "Configure", href: Paths.config.index }]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle objectType="List">Personnel</PageTitle>
                <PageControls>
                    <CreatePersonDialog trigger={<DialogTrigger asChild>
                        <Button size="icon">
                            <PlusIcon size={48}/>
                        </Button>
                    </DialogTrigger>}/>
                </PageControls>
            </PageHeader>
            <PersonnelList/>
        </AppPageContent>
    </AppPage>
}