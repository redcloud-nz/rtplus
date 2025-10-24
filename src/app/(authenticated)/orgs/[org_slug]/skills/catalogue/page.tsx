/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/competencies/skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SkillPackages_List } from './team-skill-package-list'


export const metadata = { title: 'Skills' }


export default async function SkillsModule_Catalogue_Page(props: PageProps<'/orgs/[org_slug]/skills/catalogue'>) {
     const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.catalogue
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <SkillsModule_SkillPackages_List organization={organization} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}