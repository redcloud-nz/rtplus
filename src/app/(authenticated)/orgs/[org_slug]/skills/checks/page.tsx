/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/competencies/skill-checks
 */

import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SkillChecks_List } from './skill-checks-list'



export const metadata = {
    title: "Skill Checks",
}

export default async function SkillModule_SkillChecks_Page(props: PageProps<'/orgs/[org_slug]/skills/checks'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.checks
            ]}
        />
        
        <Lexington.Page>
            <Lexington.Column width="xl">
                <SkillsModule_SkillChecks_List organization={organization} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}