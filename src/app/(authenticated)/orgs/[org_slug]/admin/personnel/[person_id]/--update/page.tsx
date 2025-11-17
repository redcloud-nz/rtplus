/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/--update
 */

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { Link } from '@/components/ui/link'
import { S2_Button } from '@/components/ui/s2-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { getPerson } from '@/server/person'
import { getOrganization } from '@/server/organization'

import { AdminModule_PersonUpdate_Form } from './update-person'



export default async function AdminModule_PersonUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/--update'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)
    const person = await getPerson(organization.orgId, personId)

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
            Paths.org(organization.slug).admin.personnel,
            { href: Paths.org(organization.slug).admin.person(personId).href, label: person.name },
            Paths.org(organization.slug).admin.person(personId).update,
        ]}/>
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={Paths.org(organization.slug).admin.person(personId)}>
                                    <ToParentPageIcon/> Person
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            back to the person
                        </TooltipContent>
                    </Tooltip>
                </Lexington.ColumnControls>
                <AdminModule_PersonUpdate_Form organization={organization} personId={person.personId} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}