/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams
 */

import { Metadata } from 'next'

import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { AdminModule_TeamsList } from './teams-list'


export const metadata: Metadata = { title: "Teams" }


export default async function AdminModule_TeamsList_Page(props: PageProps<'/orgs/[org_slug]/admin/teams'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
            <Lexington.Header breadcrumbs={[
                Paths.org(orgSlug).admin, 
                Paths.org(orgSlug).admin.teams
            ]}/>
            <Lexington.Page>
                <Lexington.Column width="xl">
                    <AdminModule_TeamsList organization={organization}/>
                </Lexington.Column>
            </Lexington.Page>
           
        </Lexington.Root>
}