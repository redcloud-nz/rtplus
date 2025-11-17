/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]
 */

import { Lexington } from '@/components/blocks/lexington'
import { EditIcon, ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'

import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Heading } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getPerson } from '@/server/person'

import { AdminModule_PersonDetails } from './person-details'
import { PersonDropdownMenu } from './person-dropdown-menu'
import { AdminModule_Person_TeamMembershipList } from './person-team-memberships-2'


export default async function AdminModule_Person_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)

    const person = await getPerson(organization.orgId, personId)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.personnel,
                person.name
            ]}
        />
        <Lexington.Page>

            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={Paths.org(organization.slug).admin.personnel }>
                                    <ToParentPageIcon/> List
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Personnel List
                        </TooltipContent>
                    </Tooltip>
                    <ButtonGroup>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(organization.slug).admin.person(personId).update}>
                                <EditIcon/> Edit
                            </Link>
                        </S2_Button>
                        <PersonDropdownMenu organization={organization} personId={person.personId}/>
                    </ButtonGroup>
                </Lexington.ColumnControls>
                

                <AdminModule_PersonDetails organization={organization} personId={person.personId}/>
                
                <Heading level={3} className="mt-6">Team Memberships</Heading>
                <AdminModule_Person_TeamMembershipList organization={organization} personId={person.personId}/>
             </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}