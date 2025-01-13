/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)/edit
 */
'use client'

import { formatISO, parseISO } from 'date-fns'
import React from 'react'

import { CompetencyAssessmentStatus } from '@prisma/client'

import { DatePicker } from '@/components/ui/date-picker'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Description } from '@/components/ui/typography'
import { useAssessmentStore } from '../../assessment-store'


export default function AssessmentEdit() {

    const assessment = useAssessmentStore(state => state.assessment)
    const updateAssessment = useAssessmentStore(state => state.updateAssessment)
    if(!assessment) return

    return <>
        <Description>Define an assessment:</Description>
        <Form>
            <FormField name="date">
                <FieldLabel>Date</FieldLabel>
                <FieldControl>
                    <DatePicker name="date" value={formatISO(assessment.date)} onChange={(newValue) => updateAssessment({ date: parseISO(newValue) })} />
                </FieldControl>
                <FieldDescription>The date the assessment is being carried out.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="name">
                <FieldLabel>Name</FieldLabel>
                <FieldControl>
                    <Input name="name" value={assessment.name} onChange={(ev) => updateAssessment({ name: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The name of the assessment.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="location">
                <FieldLabel>Location</FieldLabel>
                <FieldControl>
                    <Input name="location" value={assessment.location} onChange={(ev) => updateAssessment({ location: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The location where the assessment took place.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="status">
                <FieldLabel>Status</FieldLabel>
                <FieldControl>
                    <Select name="status" value={assessment.status} onValueChange={(newValue) => updateAssessment({ status: newValue as CompetencyAssessmentStatus })}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Complete">Complete</SelectItem>
                            <SelectItem value="Discard">Discard</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldControl>
                <FieldDescription>The status of the assessment</FieldDescription>
                <FieldMessage/>
            </FormField>
        </Form>
    </>
}
