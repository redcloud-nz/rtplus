/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel/[person_id]
 */

import { notFound } from 'next/navigation'
import * as React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { validateShortId } from '@/lib/id'
import * as Paths from '@/paths'
import { getQueryClient, HydrateClient, prefetch, trpc } from '@/trpc/server'

import { AccessCard } from './access-card'
import { TeamMembershipsCard } from './team-memberships-card'
import { PersonDetailsCard } from './person-details-card'

interface PersonPageProps {
    params: Promise<{ person_id: string }>
}

export async function generateMetadata({ params }: PersonPageProps) {
    const {person_id: personId } = await params
    if(!validateShortId(personId)) return { title: "Person" }

    const queryClient = getQueryClient()
    const person = await queryClient.fetchQuery(trpc.personnel.byId.queryOptions({ personId }))

    if(!person) return { title: "Person" }

    return { title: `${person.name} | Personnel` }
}


export default async function PersonPage(props: PersonPageProps) {
    const { person_id: personId } = await props.params
    if(!validateShortId(personId)) return notFound()

    const queryClient = getQueryClient()
    const person = await queryClient.fetchQuery(trpc.personnel.byId.queryOptions({ personId }))
    
    prefetch(trpc.teamMemberships.byPerson.queryOptions({ personId }))

    if(!person) return notFound()

    return <AppPage>
        <AppPageBreadcrumbs
            label={person.name}
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Personnel", href: Paths.system.personnel.index }
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Person">{person.name}</PageTitle>
                </PageHeader>

                <PersonDetailsCard personId={personId}/>
                <TeamMembershipsCard personId={personId}/>
                <AccessCard personId={personId}/>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}