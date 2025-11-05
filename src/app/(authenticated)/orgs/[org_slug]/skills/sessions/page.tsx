/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions
 */

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillModule_SkillCheckSessionsList } from './sessions-list'


export const metadata = { title: `Skill Check Sessions` }


export default async function SkillsModule_SkillCheckSessions_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.sessions,
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                <SkillModule_SkillCheckSessionsList organization={organization} />
            </Lexington.Column>
            
        </Lexington.Page>
    </Lexington.Root>
}