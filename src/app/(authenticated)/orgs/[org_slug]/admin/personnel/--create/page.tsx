/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/--create
 */


import { Lexington } from '@/components/blocks/lexington'
import { PersonForm } from '@/components/forms/person-form'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import { PersonData, PersonId } from '@/lib/schemas/person'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

export const metadata = { title: 'Create Person' }


export default async function AdminModule_CreatePerson_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/--create'>) { 
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const initialPerson = {
        personId: PersonId.create(),
        userId: null,
        name: '',
        email: '',
        status: 'Active',
        tags: [],
        properties: {},
    } satisfies PersonData

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin, 
                Paths.org(orgSlug).admin.personnel,
                Paths.org(orgSlug).admin.personnel.create
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <S2_Button variant="outline" asChild>
                        <Link to={Paths.org(organization.slug).admin.personnel}>
                            <ToParentPageIcon/> Personnel List
                        </Link>
                    </S2_Button>
                </Lexington.ColumnControls>
                <PersonForm
                    mode="Create"
                    organization={organization}
                    person={initialPerson}
                />
            </Lexington.Column>
        </Lexington.Page>        
    </Lexington.Root>
 }