/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel/[person_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent,  PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchPerson } from '@/server/fetch'

import { System_Person_Details_Card } from './system-person-details'
import { System_Person_TeamMemberships_Card } from './system-person-team-memberships'




export async function generateMetadata(props: { params: Promise<{ person_id: string }> }) {
    const person = await fetchPerson(props.params)
    return { title: `${person.name} - Personnel` }
}


export default async function System_Person_Page(props: { params: Promise<{ person_id: string }> }) {
    const person = await fetchPerson(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.personnel, 
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <System_Person_Details_Card personId={person.personId}/>
            </Boundary>
            <Boundary>
                <System_Person_TeamMemberships_Card person={person}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}