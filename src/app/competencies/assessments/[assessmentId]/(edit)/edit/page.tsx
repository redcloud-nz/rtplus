'use client'

import { formatISO, parseISO } from 'date-fns'
import React from 'react'

import { CompetencyAssessmentStatus } from '@prisma/client'

import { DatePicker } from '@/components/ui/date-picker'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Description } from '@/components/ui/typography'

import { useAssessmentContext } from '../../../assessment-context'

export default function AssessmentEdit({}: { params: { assessmentId: string }}) {

    const { value, updateValue } = useAssessmentContext()


    return <>
        <Description>Define an assessment:</Description>
        <Form>
            <FormField name="date">
                <FieldLabel>Date</FieldLabel>
                <FieldControl>
                    <DatePicker name="date" value={formatISO(value.date)} onChange={(newValue) => updateValue({ date: parseISO(newValue) })} />
                </FieldControl>
                <FieldDescription>The date the assessment is being carried out.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="name">
                <FieldLabel>Name</FieldLabel>
                <FieldControl>
                    <Input name="name" value={value.name} onChange={(ev) => updateValue({ name: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The name of the assessment.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="location">
                <FieldLabel>Location</FieldLabel>
                <FieldControl>
                    <Input name="location" value={value.location} onChange={(ev) => updateValue({ location: ev.target.value })}/>
                </FieldControl>
                <FieldDescription>The location where the assessment took place.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="status">
                <FieldLabel>Status</FieldLabel>
                <FieldControl>
                    <Select name="status" value={value.status} onValueChange={(newValue) => updateValue({ status: newValue as CompetencyAssessmentStatus })}>
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
