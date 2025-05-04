/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel/[person-id]
 */

import * as React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'


import * as Paths from '@/paths'
import { trpc } from '@/trpc/server'

import { AccessCard } from './access-card'
import { TeamMembershipsCard } from './team-memberships-card'
import { PersonDetailsCard } from './person-details-card'


export default async function PersonPage(props: { params: Promise<{ 'person-id': string }>}) {
    const { 'person-id': personId } = await props.params

    const person = await trpc.personnel.byId({ personId })

    if(!person) return <NotFound/>

    return <AppPage>
        <AppPageBreadcrumbs
            label={person.name}
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Personnel", href: Paths.system.personnel.index }
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
            </PageHeader>

            <PersonDetailsCard personId={personId}/>
            <TeamMembershipsCard personId={personId}/>
            <AccessCard personId={personId}/>
        </AppPageContent>
       
    </AppPage>
}