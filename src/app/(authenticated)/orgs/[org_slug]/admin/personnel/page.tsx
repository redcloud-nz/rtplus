/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { AdminModule_PersonnelList } from './personnel-list' 
import { getOrganization } from '@/server/organization'


export const metadata: Metadata = { title: "Personnel" }


export default async function AdminModule_PersonnelList_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel'>) {
    const { org_slug } = await props.params
    const organization = await getOrganization(org_slug)

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.org(org_slug).admin, 
                Paths.org(org_slug).admin.personnel
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <AdminModule_PersonnelList organization={organization}/>
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}