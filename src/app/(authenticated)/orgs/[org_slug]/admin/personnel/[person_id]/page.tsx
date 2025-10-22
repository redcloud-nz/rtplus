/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent,  PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchPerson } from '@/server/fetch'

import { AdminModule_PersonDetails } from './person-details'
import { AdminModule_Person_TeamMembershipList } from './person-team-memberships'


export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const person = await fetchPerson({ orgSlug, personId })
    return { title: `${person.name} - Personnel` }
}


export default async function AdminModule_Person_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const person = await fetchPerson({ orgSlug, personId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule(orgSlug),
                Paths.adminModule(orgSlug).personnel,
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModule_PersonDetails orgSlug={orgSlug} personId={person.personId}/>
            </Boundary>
            <Boundary>
                <AdminModule_Person_TeamMembershipList orgSlug={orgSlug} person={person}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}