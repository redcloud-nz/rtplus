/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/--create
 */

import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillsModule_NewSession_Form } from './new-session'



export const metadata = { title: `New Skill Check Session` }

export default async function SkillsModule_NewSession_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                Paths.org(organization.slug).skills.sessions.create,
            ]}
        />
        <Lexington.Page container>
            <SkillsModule_NewSession_Form organization={organization} />
        </Lexington.Page>
    </Lexington.Root>
}