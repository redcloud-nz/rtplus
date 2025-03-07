/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/personnel
 */

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'


import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Protect } from '@/components/protect'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

import { PersonnelList } from './personnel-list'
import { CreatePersonDialog } from './create-person-dialog'
import { DialogTrigger } from '@/components/ui/dialog'


export const metadata: Metadata = { title: "Personnel" }

export default async function PeopleListPage() {

    return <AppPage
        label="Personnel" 
        breadcrumbs={[{ label: "Configure", href: Paths.config.index }]}
    >
        <PageHeader>
            <PageTitle>Manage People</PageTitle>
            <PageDescription>These are the people that available for use in RT+.</PageDescription>
            <PageControls>
                <Protect permission="system:manage-personnel">
                    <CreatePersonDialog trigger={<DialogTrigger asChild>
                        <Button>
                            <PlusIcon/> New Person
                        </Button>
                    </DialogTrigger>}/>
                    
                </Protect>
            </PageControls>
        </PageHeader>
        <PersonnelList/>
    </AppPage>

  
}