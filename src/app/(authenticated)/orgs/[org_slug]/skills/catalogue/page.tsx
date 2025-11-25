/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/competencies/skills
 */


import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SkillPackages_List } from './team-skill-package-list'



export const metadata = { title: 'Skills' }


export default async function SkillsModule_Catalogue_Page(props: PageProps<'/orgs/[org_slug]/skills/catalogue'>) {
     const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.catalogue
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                <SkillsModule_SkillPackages_List organization={organization} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}