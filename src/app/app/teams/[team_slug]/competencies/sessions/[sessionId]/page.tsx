/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/sessions/[sessionId]
 */

import { notFound } from 'next/navigation'
import * as React from 'react'
import * as R from 'remeda'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { withSerializedDates } from '@/lib/serialize'
import prisma from '@/server/prisma'
import * as Paths from '@/paths'

import { AssessTabContent } from './assess-tab-content'
import { InfoTabContent } from './info-tab-content'
import { PersonnelTabContent } from './personnel-tab-content'
import { SaveFooter } from './save-footer'
import { LoadStoreData } from './skill-check-store'
import { SkillsTabContent } from './skills-tab-content'
import { TranscriptTabContent } from './transcript-tab-context'



export default async function SessionPage(props: { params: Promise<{ sessionId: string }>}) {
    const { sessionId } = await props.params

    const { sessionClaims: { rt_person_id: personId }, orgSlug } = await auth.protect()
    

    const { skills, assessees, checks, ...assessment } = await prisma.skillCheckSession.findUnique({
        where: { assessorId: personId, id: sessionId },
        include: {
            skills: { select: { id: true } },
            assessees: { select: { id: true } },
            checks: true
        }
    }) ?? notFound()

    return <AppPage>
        <AppPageBreadcrumbs
            label={`Assessment: ${assessment.name}`}
            breadcrumbs={[
                { label: "Competencies", href: Paths.team(orgSlug!).competencies.index }, 
                { label: "Assessment Sessions", href: Paths.team(orgSlug!).competencies.sessionList },
            ]}
        />
        <LoadStoreData 
            session={withSerializedDates(assessment)} 
            skillIds={skills.map(R.prop('id'))}
            assesseeIds={assessees.map(R.prop('id'))}
            checks={R.mapToObj(checks.map(withSerializedDates), c => [c.id, c])}
        />
        <AppPageContent>
            <Tabs defaultValue="Info">
                <TabsList className="mb-4 w-full md:w-auto">
                    <TabsTrigger value="Info">Info</TabsTrigger>
                    <TabsTrigger value="Skills">Skills</TabsTrigger>
                    <TabsTrigger value="Personnel">Personnel</TabsTrigger>
                    <TabsTrigger value="Assess">Assess</TabsTrigger>
                    <TabsTrigger value="Transcript">Transcript</TabsTrigger>
                </TabsList>
                <TabsContent value="Info">
                    <InfoTabContent/>
                </TabsContent>
                <TabsContent value='Skills'>
                    <SkillsTabContent/>
                </TabsContent>
                <TabsContent value='Personnel'>
                    <PersonnelTabContent/>
                </TabsContent>
                <TabsContent value='Assess'>
                    <AssessTabContent/>
                </TabsContent>
                <TabsContent value='Transcript'>
                    <TranscriptTabContent/>
                </TabsContent>
            </Tabs>
        </AppPageContent>
        
        <SaveFooter/>
    </AppPage>
}