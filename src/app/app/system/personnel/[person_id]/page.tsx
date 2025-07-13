/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/personnel/[person_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent,  PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { HydrateClient } from '@/trpc/server'

import { PersonDetailsCard } from './person-details'
import { TeamMembershipsCard } from './team-memberships'
import { getPerson, PersonParams } from '.'



export async function generateMetadata(props: { params: Promise<PersonParams> }) {
    const person = await getPerson(props.params)

    return { title: `${person.name} - Personnel` }
}


export default async function PersonPage(props: { params: Promise<PersonParams> }) {
    const person = await getPerson(props.params)

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
                    <PersonDetailsCard personId={person.id}/>
                </Boundary>
                <Boundary>
                    <TeamMembershipsCard personId={person.id}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}