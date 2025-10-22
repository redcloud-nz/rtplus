/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/teams/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { AdminModule_NewTeam_Form } from './new-team'


export default async function AdminModule_NewTeam_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/--create'>) { 
    const { org_slug: orgSlug } = await props.params

    const paths = Paths.adminModule(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule(orgSlug), 
                Paths.adminModule(orgSlug).teams,
                Paths.adminModule(orgSlug).teams.create
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create New Team</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModule_NewTeam_Form orgSlug={orgSlug} />
            </Boundary>
        </AppPageContent>
       
    </AppPage>
 }