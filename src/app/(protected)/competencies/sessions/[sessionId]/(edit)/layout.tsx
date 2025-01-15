/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)
 */

import { notFound } from 'next/navigation'
import React from 'react'
import * as R from 'remeda'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'

import prisma from '@/lib/prisma'
import { withSerializedDates } from '@/lib/serialize'
import * as Paths from '@/paths'

import { SkillCheckSessionNavigation, SavingIndicator } from './skill-check-session-navigation'
import { LoadStoreData } from '../skill-check-store'



export default async function SkillCheckSessionEditLayout(props: { children: React.ReactNode, params: Promise<{ sessionId: string }>}) {
    const { orgId, userId } = await auth.protect()

    const { sessionId } = await props.params
    const { children } = props

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
        label="Assess"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard }, 
            { label: "Sessions", href: Paths.competencies.sessionList },
        ]}
    >
        <LoadStoreData 
            session={withSerializedDates(assessment)} 
            skillIds={skills.map(R.prop('id'))}
            assesseeIds={assessees.map(R.prop('id'))}
            checks={R.mapToObj(checks, c => [c.id, withSerializedDates(c)])}
        />
        <PageHeader>
            <PageTitle>Competency Assessment</PageTitle>
            <PageControls>
                <SavingIndicator/>
            </PageControls>
        </PageHeader>
        <SkillCheckSessionNavigation sessionId={sessionId}/>
        {children}
    </AppPage>
}




