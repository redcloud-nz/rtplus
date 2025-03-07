/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /configure/teams
 */

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Protect } from '@/components/protect'

import { Button } from '@/components/ui/button'

import * as Paths from '@/paths'
import { TeamsList } from './teams-list'
import { CreateTeamDialog } from './create-team-dialog'
import { DialogTrigger } from '@/components/ui/dialog'




export const metadata: Metadata = { title: "Teams" }

export default async function TeamsListPage() {
    
    return <AppPage 
        label="Teams"
        breadcrumbs={[{ label: "Configure", href: Paths.config.index }]}
    >
        <PageHeader>
            <PageTitle>Manage Teams</PageTitle>
            <PageDescription>These are the teams that are available for use in RT+.</PageDescription>
            <PageControls>
                <Protect permission="system:manage-teams">
                    <CreateTeamDialog trigger={<DialogTrigger asChild>
                        <Button>
                            <PlusIcon/> New Team
                        </Button>
                    </DialogTrigger>}/>
                </Protect>
            </PageControls>
        </PageHeader>
        <TeamsList/>
    </AppPage>

}