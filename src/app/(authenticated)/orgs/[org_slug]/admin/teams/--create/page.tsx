/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/teams/--create
 */

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { AdminModule_CreateTeam_Form } from './create-team'

export const metadata = {
    title: 'Create Team'
}

export default async function AdminModule_CreateTeam_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/--create'>) { 
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)


    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin, 
                Paths.org(orgSlug).admin.teams,
                Paths.org(orgSlug).admin.teams.create
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <S2_Button variant="outline" asChild>
                        <Link to={Paths.org(orgSlug).admin.teams}>
                            <ToParentPageIcon/> Teams List
                        </Link>
                    </S2_Button>
                </Lexington.ColumnControls>
                <AdminModule_CreateTeam_Form organization={organization} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
 }