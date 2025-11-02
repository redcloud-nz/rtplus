/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/[session_id]
 */

import { ChevronRightIcon } from 'lucide-react'

import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SessionDetails } from './session-details'
import { Lexington } from '@/components/blocks/lexington'
import { Item, ItemActions, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/items'
import { StatItem, StatItemDescription, StatItemTitle, StatItemValue } from '@/components/ui/stat-item'




export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return { title: `${session.name} - Skill Check Sessions` }
}

export default async function SkillsModule_Session_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                session.name,
            ]}
        />
        <Lexington.Page dual>

            <SkillsModule_SessionDetails organization={organization} sessionId={session.sessionId}/>

            <div className="flex flex-col gap-4 lg:mt-11">
                <Item variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skills.session(session.sessionId).record}>
                    <ItemContent>
                        <ItemTitle>Configure and Record</ItemTitle>
                        <ItemDescription>Select skills and assessors then bulk record your skill checks.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <ChevronRightIcon className="size-4" />
                    </ItemActions>
                    </Link>
                </Item>
                <Item variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skills.session(session.sessionId).review}>
                    <ItemContent>
                        <ItemTitle>Review</ItemTitle>
                        <ItemDescription>Review and approve the recorded checks.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <ChevronRightIcon className="size-4" />
                    </ItemActions>
                    </Link>
                </Item>
                <div className="flex gap-2">
                    <StatItem>  
                        <StatItemValue>{0}</StatItemValue>
                        <StatItemTitle>Assessees</StatItemTitle>
                        <StatItemDescription>assigned to the session</StatItemDescription>
                    </StatItem>
                    <StatItem>  
                        <StatItemValue>{0}</StatItemValue>
                        <StatItemTitle>Skills</StatItemTitle>
                        <StatItemDescription>assigned to the session</StatItemDescription>
                    </StatItem>
                    <StatItem>  
                        <StatItemValue>{0}</StatItemValue>
                        <StatItemTitle>Checks</StatItemTitle>
                        <StatItemDescription>recorded in the session</StatItemDescription>
                    </StatItem>
                </div>
            </div>
            
        </Lexington.Page>
    </Lexington.Root>
}