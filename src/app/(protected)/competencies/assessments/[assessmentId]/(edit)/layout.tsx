/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)
 */

import React from 'react'

import { auth } from '@clerk/nextjs/server'


import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'

import prisma from '@/lib/prisma'
import * as Paths from '@/paths'

import { AssessmentContextProvider } from '../assessment-context'
import { AssessmentNavigaton, SavingIndicator } from './assessment-navigation'
import { notFound } from 'next/navigation'


export default async function AssessmentEditLayout(props: { children: React.ReactNode, params: Promise<{ assessmentId: string }>}) {
    const { orgId, userId } = await auth.protect()

    const { assessmentId } = await props.params
    const { children } = props

    const { skills, assessees, ...asessment } = await prisma.competencyAssessment.findFirst({
        where: { 
            orgId, userId,
        },
        include: {
            skills: { select: { id: true } },
            assessees: { select: { id: true } },
            checks: true
        }
    }) ?? notFound()

    return <AssessmentContextProvider 
        assessment={{
            ...asessment,
            skillIds: skills.map(skill => skill.id),
            assesseeIds: assessees.map(assessee => assessee.id)
        }}
    >
        <AppPage 
            label="Assess"
            breadcrumbs={[
                { label: "Competencies", href: Paths.competencies.dashboard }, 
                { label: "Assessments", href: Paths.competencies.assessmentList },
            ]}
        >
            <PageHeader>
                <PageTitle>Competency Assessment</PageTitle>
                <PageControls>
                    <SavingIndicator/>
                </PageControls>
            </PageHeader>
            <AssessmentNavigaton assessmentId={assessmentId}/>
            {children}
        </AppPage>
    </AssessmentContextProvider>
}




