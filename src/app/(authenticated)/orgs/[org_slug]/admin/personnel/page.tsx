/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel
 */

import { Metadata } from 'next'

import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'

import { getOrganization } from '@/server/organization'

import { AdminModule_PersonnelList } from './personnel-list' 


export const metadata: Metadata = { title: "Personnel" }


export default async function AdminModule_PersonnelList_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel'>) {
    const { org_slug } = await props.params
    const organization = await getOrganization(org_slug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(org_slug).admin, 
                Paths.org(org_slug).admin.personnel
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                <AdminModule_PersonnelList organization={organization}/>
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}