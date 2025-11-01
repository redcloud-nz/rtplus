/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills/checks/--create
 */


import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillsModule_NewCheck_Form } from './new-check'




export const metadata = { title: 'Create Skill Check' }

export default async function SkillsModule_NewCheck_Page(props: PageProps<'/orgs/[org_slug]/skills/checks/--create'>) {
    const { org_slug: orgSlug } = await props.params
        const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.checks,
                Paths.org(organization.slug).skills.checks.create,
            ]}
        />
        <Lexington.Page container>
            <SkillsModule_NewCheck_Form organization={organization} />
        </Lexington.Page>
    </Lexington.Root>
}


