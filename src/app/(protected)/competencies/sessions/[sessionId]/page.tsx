/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/sessions/[sessionId]
 */

import { notFound } from 'next/navigation'
import * as React from 'react'
import * as R from 'remeda'


import { AppPage } from '@/components/app-page'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { authenticated } from '@/lib/server/auth'
import { withSerializedDates } from '@/lib/serialize'
import prisma from '@/lib/server/prisma'
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

    const { userPersonId } = await authenticated()
    

    const { skills, assessees, checks, ...assessment } = await prisma.skillCheckSession.findUnique({
        where: { assessorId: userPersonId, id: sessionId },
        include: {
            skills: { select: { id: true } },
            assessees: { select: { id: true } },
            checks: true
        }
    }) ?? notFound()

    return <AppPage
        label={`Assessment: ${assessment.name}`}
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard }, 
            { label: "Assessment Sessions", href: Paths.competencies.sessionList },
        ]}
        footer={<SaveFooter/>}
    >
        <LoadStoreData 
            session={withSerializedDates(assessment)} 
            skillIds={skills.map(R.prop('id'))}
            assesseeIds={assessees.map(R.prop('id'))}
            checks={R.mapToObj(checks.map(withSerializedDates), c => [c.id, c])}
        />
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
        
    </AppPage>
}