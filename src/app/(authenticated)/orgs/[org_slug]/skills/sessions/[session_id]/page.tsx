/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/[session_id]
 */


import { Lexington } from '@/components/blocks/lexington'
import { BackToListIcon, EditIcon, ItemLinkActionIcon, SessionRecordIcon, SessionReviewIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { S2_Value } from '@/components/ui/s2-value'

import { formatDate, TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'


import { AssignedAssesseesCount_Card, AssignedSkillsCount_Card, RecordedChecksCount_Card } from './session-stats'


export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return { title: `${session.name} ${TITLE_SEPARATOR} Skill Check Sessions` }
}

export default async function SkillsModule_Session_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId })

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                session.name,
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={Paths.org(organization.slug).skills.sessions}>
                                    <BackToListIcon/> List
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            back to list
                        </TooltipContent>
                    </Tooltip>
                    <S2_Button variant="outline" asChild>
                        <Link to={Paths.org(organization.slug).skills.session(session.sessionId).update}>
                            <EditIcon/> Edit
                        </Link>
                    </S2_Button>
                </Lexington.ColumnControls>
                <S2_Card>
                    <S2_CardHeader>
                        <S2_CardTitle>Session Details</S2_CardTitle>
                    </S2_CardHeader>
                    <S2_CardContent>
                        <FieldGroup>
                            <Field orientation='responsive'>
                                <FieldLabel>SesionId</FieldLabel>
                                <S2_Value value={session.sessionId} className="min-w-1/2"/>
                            </Field>
                            <Field orientation='responsive'>
                                <FieldLabel>Name</FieldLabel>
                                <S2_Value value={session.name} className="min-w-1/2"/>
                            </Field>
                            <Field orientation='responsive'>
                                <FieldLabel>Date</FieldLabel>
                                <S2_Value value={formatDate(session.date)} className="min-w-1/2"/>
                            </Field>
                            <Field orientation='responsive'>
                                <FieldLabel>Status</FieldLabel>
                                <S2_Value value={session.sessionStatus} className="min-w-1/2"/>
                            </Field>
                        </FieldGroup>
                    </S2_CardContent>
                </S2_Card>
                
                <ItemGroup>
                    { session.sessionStatus == 'Draft' 
                        ? <Item asChild>
                            <Link to={Paths.org(organization.slug).skills.session(session.sessionId).record}>
                                <ItemMedia>
                                    <SessionRecordIcon/>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Configure and Record</ItemTitle>
                                    <ItemDescription>Select skills and assessors then bulk record your skill checks.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ItemLinkActionIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                        : null
                    }
                    <Item asChild>
                        <Link to={Paths.org(organization.slug).skills.session(session.sessionId).review}>
                            <ItemMedia>
                                <SessionReviewIcon/>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Review</ItemTitle>
                                <ItemDescription>Review skill checks and select which should be included in reporting.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ItemLinkActionIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                </ItemGroup>
                <div className="flex gap-2 justify-center">
                    <AssignedAssesseesCount_Card organization={organization} sessionId={session.sessionId} />
                    <AssignedSkillsCount_Card organization={organization} sessionId={session.sessionId} />
                    <RecordedChecksCount_Card organization={organization} sessionId={session.sessionId} />
                </div>
            </Lexington.Column>
                
        </Lexington.Page>
    </Lexington.Root>
}