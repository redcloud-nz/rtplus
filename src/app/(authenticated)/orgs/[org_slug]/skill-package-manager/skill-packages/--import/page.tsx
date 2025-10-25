/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/skill-packages/--import
 */

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import ImportSkillPackage_Content from './import-skill-package'


export default async function ImportSkillPackage_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/--import'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).spm,
                Paths.org(orgSlug).spm.skillPackages,
                Paths.org(orgSlug).spm.skillPackages.import,
            ]}
        />
        <ImportSkillPackage_Content organization={organization} />
    </AppPage>
}


