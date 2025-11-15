/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills/sessions/[session_id]/record
 */

import { CheckCheckIcon, CheckIcon, InfoIcon, PocketKnifeIcon, ScrollTextIcon, UserIcon, UsersIcon } from 'lucide-react'

import { Lexington } from '@/components/blocks/lexington'
import { Boundary } from '@/components/boundary'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Paragraph } from '@/components/ui/typography'

import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { fetchCurrentPerson, fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { PersonRequireMessage } from '../../../person-required-message'

import { SkillRecorder_Session_Assessees } from './skill-recorder-session-assessees'
import { SkillRecorder_Session_Details } from './skill-recorder-session-details'
import { SkillRecorder_Session_RecordByAssessee } from './skill-recorder-session-record-by-assessee'
import { SkillRecorder_Session_RecordBySkill } from './skill-recorder-session-record-by-skill'
import { SkillRecorder_Session_Prefetch } from './skill-recorder-prefetch'
import { SkillRecorder_Session_RecordSingle } from './skill-recorder-session-record-single'
import { SkillRecorder_Session_Skills } from './skill-recorder-session-skills'
import { SkillRecorder_Session_Transcript } from './skill-recorder-session-transcript'





export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]/record'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return { title: `Record ${TITLE_SEPARATOR} ${session.name}` }
}

export default async function SkillsModule_SessionRecord_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]/record'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})
    const currentPerson = await fetchCurrentPerson({ orgId: organization.orgId })

    const breadcrumbs = [
        Paths.org(organization.slug).skills,
        Paths.org(organization.slug).skills.sessions,
        { href: Paths.org(organization.slug).skills.session(session.sessionId).href, label: session.name },
        Paths.org(organization.slug).skills.session(session.sessionId).record,
    ]

    if(!currentPerson || session.sessionStatus != 'Draft') {
        return <Lexington.Root>
            <Lexington.Header
                breadcrumbs={breadcrumbs}
            />
            <Lexington.Page>
                <Lexington.Column width="md" className="py-8">
                    {!currentPerson && <PersonRequireMessage/>}
                    {session.sessionStatus != 'Draft' && <Paragraph>This session is not a draft, therefore recording is not permitted.</Paragraph>}
                </Lexington.Column>
            </Lexington.Page>
        </Lexington.Root>
    }

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={breadcrumbs}
        />
        <Lexington.Page>
            <Lexington.Column width="lg" className="pt-0">
                <Tabs defaultValue='details'>
                    <div className="sticky top-0 z-10 bg-background/90 pt-4 flex justify-center">
                        <TabsList className="h-[40px] ">
                            <TabsTrigger value="details">
                                <span className="inline lg:hidden"><InfoIcon className="size-4"/></span>
                                <span className="hidden lg:inline">Details</span>
                            </TabsTrigger>
                            <TabsTrigger value="assessees">
                                <span className="inline lg:hidden"><UsersIcon className="size-4"/></span>
                                <span className="hidden lg:inline">Personnel</span>
                            </TabsTrigger>
                            <TabsTrigger value="skills">
                                <span className="inline lg:hidden"><PocketKnifeIcon className="size-4"/></span>
                                <span className="hidden lg:inline">Skills</span>
                            </TabsTrigger>
                            <Separator orientation="vertical" className="mx-2"/>
                            <TabsTrigger value="record-single">
                                <span className="inline lg:hidden"><CheckIcon className="size-4"/></span>
                                <span className="hidden lg:inline">Single</span>
                            </TabsTrigger>
                            <TabsTrigger value="record-by-assessee">
                                <span className="inline lg:hidden relative"><UserIcon className="size-3 absolute -left-1 -top-1"/><CheckCheckIcon className="size-4 relative left-1 top-1"/></span>
                                <span className="hidden lg:inline">By Person</span>
                            </TabsTrigger>
                            <TabsTrigger value="record-by-skill">
                                <span className="inline lg:hidden relative"><PocketKnifeIcon className="size-3 absolute -left-1 -top-1"/><CheckCheckIcon className="size-4 relative left-1 top-1"/></span>
                                <span className="hidden lg:inline">By Skill</span>
                            </TabsTrigger>
                            <Separator orientation="vertical" className="mx-2"/>
                            <TabsTrigger value="transcript">
                                <span className="inline lg:hidden"><ScrollTextIcon className="size-4"/></span>
                                <span className="hidden lg:inline">Transcript</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    

                    <SkillRecorder_Session_Prefetch orgId={organization.orgId} sessionId={session.sessionId}/>
                    <Boundary
                        slotProps={{
                            loadingFallback: { 
                                className: "mt-8 aspect-square"
                            }
                        }}
                    >
                        <TabsContent value="details">
                            <SkillRecorder_Session_Details organization={organization} session={session} />
                        </TabsContent>
                        <TabsContent value="assessees">
                            <SkillRecorder_Session_Assessees organization={organization} session={session}/>
                        </TabsContent>
                        <TabsContent value="skills">
                            <SkillRecorder_Session_Skills organization={organization} session={session}/>
                        </TabsContent>
                        <TabsContent value="record-single">
                            <SkillRecorder_Session_RecordSingle organization={organization} session={session}/>
                        </TabsContent>
                        <TabsContent value="record-by-assessee">
                            <SkillRecorder_Session_RecordByAssessee organization={organization} session={session}/>
                        </TabsContent>
                        <TabsContent value="record-by-skill">
                            <SkillRecorder_Session_RecordBySkill organization={organization} session={session}/>
                        </TabsContent>
                        <TabsContent value="transcript">
                            <SkillRecorder_Session_Transcript organization={organization} session={session}/>
                        </TabsContent>
                    </Boundary>
                    
                </Tabs>
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}

