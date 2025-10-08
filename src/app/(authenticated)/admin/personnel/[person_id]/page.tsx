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

import { PersonDetails_Card } from './person-details'
import { Person_TeamMemberships_List } from './person-team-memberships'


export async function generateMetadata(props: PageProps<'/admin/personnel/[person_id]'>) {
    const person = await fetchPerson(props.params)
    return { title: `${person.name} - Personnel` }
}


export default async function Person_Page(props: PageProps<'/admin/personnel/[person_id]'>) {
    const person = await fetchPerson(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.personnel, 
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <PersonDetails_Card personId={person.personId}/>
            </Boundary>
            <Boundary>
                <Person_TeamMemberships_List person={person}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}