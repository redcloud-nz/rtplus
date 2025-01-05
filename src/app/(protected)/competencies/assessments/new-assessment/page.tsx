/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/new-assessment
 */

import { redirect } from 'next/navigation'
import React from 'react'
import { z } from 'zod'

import { auth } from '@clerk/nextjs/server'


import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { DatePicker } from '@/components/ui/date-picker'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FieldLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { FormState, fromErrorToFormState } from '@/lib/form-state'
import prisma from '@/lib/prisma'

import { assertNonNull } from '@/lib/utils'
import * as Paths from '@/paths'


const CreateAssessmentFormSchema = z.object({
    name: z.string(),
    location: z.string(),
    date: z.string().date()
})

export default function NewAssessmentPage() {

    return <AppPage
        label="New Assessment"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard }, 
            { label: "Assessments", href: Paths.competencies.assessmentList },
        ]}
    >
        <PageTitle>New Competency Assessment</PageTitle>
        <PageDescription>Start a new competency assessment.</PageDescription>
        <Form action={createAssessmentAction}>

            <FormField name="date">
                <FieldLabel>Assessment Date</FieldLabel>
                <FieldControl>
                    <DatePicker name="date" />
                </FieldControl>
                <FieldDescription>The date on which the assessment is occuring.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="name">
                <FieldLabel>Name</FieldLabel>
                <FieldControl>
                    <Input name="name"/>
                </FieldControl>
                <FieldDescription>The name of the assessment.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="location">
                <FieldLabel>Location</FieldLabel>
                <FieldControl>
                    <Input name="location"/>
                </FieldControl>
                <FieldDescription>The location where the assessment took place.</FieldDescription>
                <FieldMessage/>
            </FormField>
        </Form>

    </AppPage>
}


async function createAssessmentAction(formState: FormState, formData: FormData) {
    'use server'

    const { userId, orgId } = await auth.protect()
    assertNonNull(orgId, "An active organization is required to execute 'createAssessmentAction'")

    let assessmentId: string
    try {
        const fields = CreateAssessmentFormSchema.parse(Object.fromEntries(formData))

        const createdAssessment = await prisma.competencyAssessment.create({
            data: {
                userId, orgId,
                date: fields.date,
                name: fields.name,
                location: fields.location
            }
        })

        assessmentId = createdAssessment.id
    } catch(error) {
        return fromErrorToFormState(error)
    }

    redirect(Paths.competencies.assessment(assessmentId).skills)
}