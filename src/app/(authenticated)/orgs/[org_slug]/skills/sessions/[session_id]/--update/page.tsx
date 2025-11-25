/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/[session_id]/--update
 */

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'

import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { SkillsModule_UpdateSession_Form } from './update-session'



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]/--update'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return { title: `Update ${TITLE_SEPARATOR} ${session.name}` }
}

export default async function SkillsModule_SessionUpdate_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]/--update'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    const skillsPath = Paths.org(organization.slug).skills

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
            skillsPath,
            skillsPath.sessions,
            { href: skillsPath.session(session.sessionId).href, label: session.name },
            skillsPath.session(session.sessionId).update,
        ]}/>
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Hermes.Section>
                    <Hermes.SectionHeader>
                        <Hermes.BackButton to={skillsPath.session(session.sessionId)}>
                            Session 
                        </Hermes.BackButton>
                    </Hermes.SectionHeader>

                    <SkillsModule_UpdateSession_Form organization={organization} session={session} />
                </Hermes.Section>
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>

}