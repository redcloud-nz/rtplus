/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/teams/new
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'


import * as Paths from '@/paths'

import { CreateTeamForm } from './create-team-form'


export const metadata: Metadata = { title: "New Team" }

export default function NewTeamPage() {

    return <AppPage
        label="New Team"
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index },
            { label: "Teams", href: Paths.config.teams.index },
        ]}    
    >
        <PageTitle>New Team</PageTitle>
        <PageDescription>Create a new team.</PageDescription>
        <CreateTeamForm/>
    </AppPage>
}