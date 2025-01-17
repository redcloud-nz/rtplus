/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/sessions/[sessionId]/v2
 */

import { notFound } from 'next/navigation'
import * as React from 'react'
import * as R from 'remeda'

import { auth } from '@clerk/nextjs/server'

import { AppPage } from '@/components/app-page'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import prisma from '@/lib/prisma'
import { withSerializedDates } from '@/lib/serialize'
import * as Paths from '@/paths'

import { LoadStoreData } from '../skill-check-store'

import { InfoTabContent } from './InfoTabContent'
import { SkillsTabContent } from './SkillsTabContext'



export default async function SessionPage(props: { params: Promise<{ sessionId: string }>}) {
    const params = await props.params;

    const { orgId, userId } = await auth.protect()

    const { sessionId } = await props.params

    const { skills, assessees, checks, ...assessment } = await prisma.skillCheckSession.findFirst({
        where: { 
            orgId, userId,
        },
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
        footer={<>
            Footer
        </>}
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
            </TabsList>
            <TabsContent value="Info">
                <InfoTabContent/>
            </TabsContent>
            <TabsContent value='Skills'>
                <SkillsTabContent/>
            </TabsContent>
        </Tabs>
        
    </AppPage>
}