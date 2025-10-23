/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent,  PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { fetchPerson } from '@/server/fetch'

import { AdminModule_PersonDetails } from './person-details'
import { AdminModule_Person_TeamMembershipList } from './person-team-memberships'



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)

    const person = await fetchPerson({ orgId: organization.orgId, personId })

    return { title: `${person.name} - Personnel` }
}


export default async function AdminModule_Person_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)

    const person = await fetchPerson({ orgId: organization.orgId, personId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.personnel,
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Person">{person.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModule_PersonDetails organization={organization} personId={person.personId}/>
            </Boundary>
            <Boundary>
                <AdminModule_Person_TeamMembershipList organization={organization} person={person}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}