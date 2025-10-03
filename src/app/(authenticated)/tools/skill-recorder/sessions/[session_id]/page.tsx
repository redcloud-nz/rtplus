/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/skill-recorder/sessions/[session_id]
 */

import { CheckCheckIcon, CheckIcon, InfoIcon, PocketKnifeIcon, ScrollTextIcon, UserIcon, UsersIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs} from '@/components/app-page'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SkillRecorder_Session_Assessees } from './skill-recorder-session-assessees'
import { SkillRecorder_Session_Details } from './skill-recorder-session-details'
import { SkillRecorder_Session_RecordByAssessee } from './skill-recorder-session-record-by-assessee'
import { SkillRecorder_Session_RecordBySkill } from './skill-recorder-session-record-by-skill'
import { SkillRecorder_Session_RecordSingle } from './skill-recorder-session-record-single'
import { SkillRecorder_Session_Skills } from './skill-recorder-session-skills'
import { SkillRecorder_Session_Transcript } from './skill-recorder-session-transcript'

import { fetchSkillCheckSession } from '@/server/fetch'
import { Boundary } from '@/components/boundary'


export async function generateMetadata(props: PageProps<'/tools/skill-recorder/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `${session.name}` }
}

export default async function CompetencyRecorder_Session_Page(props: PageProps<'/tools/skill-recorder/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={["Skill Recording Session"]}
        />

        <Tabs defaultValue='details' className="col-span-full row-start-3 row-end-5 flex flex-col items-center *:w-full xl:*:w-4xl p-2">
            <TabsList variant="stretch" className="w-full h-[40px]">
                <TabsTrigger value="details">
                    <span className="inline md:hidden"><InfoIcon className="size-4"/></span>
                    <span className="hidden md:inline">Details</span>
                </TabsTrigger>
                <TabsTrigger value="assessees">
                    <span className="inline md:hidden"><UsersIcon className="size-4"/></span>
                    <span className="hidden md:inline">Personnel</span>
                </TabsTrigger>
                <TabsTrigger value="skills">
                    <span className="inline md:hidden"><PocketKnifeIcon className="size-4"/></span>
                    <span className="hidden md:inline">Skills</span>
                </TabsTrigger>
                <Separator orientation="vertical" className="mx-2"/>
                <TabsTrigger value="record-single">
                    <span className="inline md:hidden"><CheckIcon className="size-4"/></span>
                    <span className="hidden md:inline">Single</span>
                </TabsTrigger>
                <TabsTrigger value="record-by-assessee">
                    <span className="inline md:hidden relative"><UserIcon className="size-3 absolute -left-1 -top-1"/><CheckCheckIcon className="size-4 relative left-1 top-1"/></span>
                    <span className="hidden md:inline">By Person</span>
                </TabsTrigger>
                <TabsTrigger value="record-by-skill">
                    <span className="inline md:hidden relative"><PocketKnifeIcon className="size-3 absolute -left-1 -top-1"/><CheckCheckIcon className="size-4 relative left-1 top-1"/></span>
                    <span className="hidden md:inline">By Skill</span>
                </TabsTrigger>
                <Separator orientation="vertical" className="mx-2"/>
                <TabsTrigger value="transcript">
                    <span className="inline md:hidden"><ScrollTextIcon className="size-4"/></span>
                    <span className="hidden md:inline">Transcript</span>
                </TabsTrigger>
            </TabsList>
            <Boundary>
                <TabsContent value="details">
                    <SkillRecorder_Session_Details sessionId={session.sessionId}/>
                </TabsContent>
                <TabsContent value="assessees">
                    <SkillRecorder_Session_Assessees sessionId={session.sessionId}/>
                </TabsContent>
                <TabsContent value="skills">
                    <SkillRecorder_Session_Skills sessionId={session.sessionId} />
                </TabsContent>
                <TabsContent value="record-single">
                    <SkillRecorder_Session_RecordSingle sessionId={session.sessionId}/>
                </TabsContent>
                <TabsContent value="record-by-assessee">
                    <SkillRecorder_Session_RecordByAssessee sessionId={session.sessionId}/>
                </TabsContent>
                <TabsContent value="record-by-skill">
                    <SkillRecorder_Session_RecordBySkill sessionId={session.sessionId}/>
                </TabsContent>
                <TabsContent value="transcript">
                    <SkillRecorder_Session_Transcript sessionId={session.sessionId}/>
                </TabsContent>
            </Boundary>
            
        </Tabs>
    </AppPage>
}

