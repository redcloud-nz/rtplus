/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/--update
 */


import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { PersonForm } from '@/components/forms/person-form'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getPerson } from '@/server/person'



export default async function AdminModule_PersonUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/--update'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)
    const person = await getPerson(organization.orgId, personId)

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(organization.slug).admin.person(personId)}>
                    {person.name}
                </Hermes.BackButton>
            </Hermes.SectionHeader>

            <PersonForm 
                mode="Update"
                organization={organization} 
                person={person}
            />
        </Hermes.Section>
    </Lexington.Column>
}