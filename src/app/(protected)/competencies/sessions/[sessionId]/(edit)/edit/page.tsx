/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)/edit
 */
'use client'

import React from 'react'

import { SkillCheckSessionStatus } from '@prisma/client'

import { DatePicker } from '@/components/ui/date-picker'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Description } from '@/components/ui/typography'
import { useSkillCheckStore } from '../../skill-check-store'


export default function AssessmentEdit() {

    const session = useSkillCheckStore(state => state.session)
    const updateAssessment = useSkillCheckStore(state => state.updateSession)
    if(!session) return

    return <>
        <Description>Define an assessment:</Description>
        <Form>
            <FormField name="date">
                <FieldLabel>Date</FieldLabel>
                <FieldControl>
                    <DatePicker name="date" value={session.date} onChange={(newValue) => updateAssessment({ date: newValue})} />
                </FieldControl>
                <FieldDescription>The date the assessment is being carried out.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="name">
                <FieldLabel>Name</FieldLabel>
                <FieldControl>
                    <Input name="name" value={session.name} onChange={(ev) => updateAssessment({ name: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The name of the assessment.</FieldDescription>
                <FieldMessage/>
            </FormField>
            {/* <FormField name="location">
                <FieldLabel>Location</FieldLabel>
                <FieldControl>
                    <Input name="location" value={session.location} onChange={(ev) => updateAssessment({ location: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The location where the assessment took place.</FieldDescription>
                <FieldMessage/>
            </FormField> */}
            <FormField name="status">
                <FieldLabel>Status</FieldLabel>
                <FieldControl>
                    <Select name="status" value={session.status} onValueChange={(newValue) => updateAssessment({ status: newValue as SkillCheckSessionStatus })}>
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
