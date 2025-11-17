/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/--create
 */


import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { AdminModule_CreatePerson_Form } from './create-person'


export default async function AdminModule_CreatePerson_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/--create'>) { 
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

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
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={Paths.org(organization.slug).admin.personnel}>
                                    <ToParentPageIcon/> List
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            back to list
                        </TooltipContent>
                    </Tooltip>
                </Lexington.ColumnControls>
                <AdminModule_CreatePerson_Form organization={organization} />
            </Lexington.Column>
        </Lexington.Page>        
    </Lexington.Root>
 }