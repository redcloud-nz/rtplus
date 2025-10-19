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

import { AdminModule_PersonDetails } from './person-details'
import { AdminModule_Person_TeamMembershipList } from './person-team-memberships'


export async function generateMetadata(props: PageProps<'/admin/personnel/[person_id]'>) {
    const person = await fetchPerson(props.params)
    return { title: `${person.name} - Personnel` }
}


export default async function AdminModule_Person_Page(props: PageProps<'/admin/personnel/[person_id]'>) {
    const person = await fetchPerson(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule,
                Paths.adminModule.personnel, 
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModule_PersonDetails personId={person.personId}/>
            </Boundary>
            <Boundary>
                <AdminModule_Person_TeamMembershipList person={person}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}