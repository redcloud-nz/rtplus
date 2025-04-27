/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /configure/teams
 */

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import * as Paths from '@/paths'

import { CreateTeamDialog } from './create-team-dialog'
import { TeamsList } from './teams-list'


export const metadata: Metadata = { title: "Teams" }

export default async function TeamsListPage() {
    return <AppPage>
        <AppPageBreadcrumbs
            label="Teams"
            breadcrumbs={[{ label: "Configure", href: Paths.config.index }]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle>Manage Teams</PageTitle>
                <PageDescription>These are the teams that are available for use in RT+.</PageDescription>
                <PageControls>
                    <CreateTeamDialog trigger={<DialogTrigger asChild>
                        <Button>
                            <PlusIcon/> New Team
                        </Button>
                    </DialogTrigger>}/>
                </PageControls>
            </PageHeader>
            <TeamsList/>
        </AppPageContent>
    </AppPage>

}