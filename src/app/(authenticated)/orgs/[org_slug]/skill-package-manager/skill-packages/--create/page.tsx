/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/--create
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { AdminModile_NewSkillPackage_Form } from './new-skill-package'



export const metadata: Metadata = {
    title: 'Create Skill Package'
}

export default async function AdminModile_NewSkillPackage_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organisation = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).spm,
                Paths.org(orgSlug).spm.skillPackages,
                Paths.org(orgSlug).spm.skillPackages.create
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create Skill Package</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModile_NewSkillPackage_Form organization={organisation} />
            </Boundary>
        </AppPageContent>
    </AppPage>
 }