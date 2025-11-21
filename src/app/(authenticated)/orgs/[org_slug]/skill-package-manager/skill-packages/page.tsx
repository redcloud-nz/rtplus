/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages
 */


import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillPackageManagerModule_SkillPackagesList } from './skill-package-list'



export const metadata = { title: "Skill Packages" }

export default async function SkillPackageManagerModule_SkillPackagesList_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).spm,
                Paths.org(orgSlug).spm.skillPackages,
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                 <SkillPackageManagerModule_SkillPackagesList organization={organization} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}