/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/[session_id]/--update
 */

import { Lexington } from '@/components/blocks/lexington'
import { BackToListIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
                 <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={skillsPath.session(session.sessionId)}>
                                    <BackToListIcon/> Session
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            back to session
                        </TooltipContent>
                    </Tooltip>
                </Lexington.ColumnControls>
                <SkillsModule_UpdateSession_Form organization={organization} session={session} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>

}