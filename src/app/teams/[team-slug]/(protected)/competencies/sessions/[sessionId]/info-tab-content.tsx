/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/session/[sessionId]/(edit)/edit
 */
'use client'

import React from 'react'

import { type SkillCheckSessionStatus } from '@prisma/client'

import { DatePicker } from '@/components/ui/date-picker'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useSkillCheckStore } from './skill-check-store'


export function InfoTabContent() {

    const session = useSkillCheckStore(state => state.session)
    const updateAssessment = useSkillCheckStore(state => state.updateSession)
    if(!session) return

    return <>
        <Form>
            <FormField name="name">
                <FieldLabel>Session Name</FieldLabel>
                <FieldControl>
                    <Input name="name" value={session.name} onChange={(ev) => updateAssessment({ ...session, name: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The name of the assessment.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="date">
                <FieldLabel>Session Date</FieldLabel>
                <FieldControl>
                    <DatePicker name="date" value={session.date} onChange={(newValue) => updateAssessment({ ...session, date: newValue})} />
                </FieldControl>
                <FieldDescription>The date the assessment is being carried out.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="status">
                <FieldLabel>Status</FieldLabel>
                <FieldControl>
                    <Select name="status" value={session.status} onValueChange={(newValue) => updateAssessment({ ...session, status: newValue as SkillCheckSessionStatus })}>
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
