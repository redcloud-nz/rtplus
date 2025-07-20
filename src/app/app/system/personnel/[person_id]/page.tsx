/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/personnel/[person_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent,  PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchPerson } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { PersonDetailsCard } from './person-details'
import { TeamMembershipsCard } from './team-memberships'




export async function generateMetadata(props: { params: Promise<{ person_id: string }> }) {
    const person = await fetchPerson(props.params)
    return { title: `${person.name} - Personnel` }
}


export default async function PersonPage(props: { params: Promise<{ person_id: string }> }) {
    const person = await fetchPerson(props.params)

    prefetch(trpc.teamMemberships.byPerson.queryOptions({ personId: person.personId}))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.personnel, 
                person.name
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Person">{person.name}</PageTitle>
                </PageHeader>

                <Boundary>
                    <PersonDetailsCard personId={person.personId}/>
                </Boundary>
                <Boundary>
                    <TeamMembershipsCard personId={person.personId}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}