/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/--create
 */


import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'

import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getPerson } from '@/server/person'

import AdminModule_Person_CreateTeamMembership_Form from './create-team-membership'



export default async function AdminModule_Person_TeamMembership_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/--create'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)
    const person = await getPerson(organization.orgId, personId)

    

    return <Lexington.Column width="lg">
        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.person(personId)}>
                    <ToParentPageIcon/> {person.name}
                </Link>
            </S2_Button>
        </Lexington.ColumnControls>
        <S2_Card>
            <S2_CardHeader>
                <S2_CardTitle>Add {person.name} to a team</S2_CardTitle>
            </S2_CardHeader>
            <S2_CardContent>
                <AdminModule_Person_CreateTeamMembership_Form organization={organization} personId={person.personId}/>
            </S2_CardContent>
        </S2_Card>
    </Lexington.Column>
}