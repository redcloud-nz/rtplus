'use client'

import React from 'react'
import { z } from 'zod'

import { DatePicker } from '@/components/ui/date-picker'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Description } from '@/components/ui/typography'


import { FormState, fromErrorToFormState, toFormState } from '@/lib/form-state'

const EditAssessmentSchema = z.object({
    date: z.string().datetime(),
    name: z.string(),
    location: z.string(),
    status: z.enum(['Draft', 'Complete', 'Discard'])
})

export default function AssessmentEdit({ params }: { params: { assessmentId: string }}) {

    async function submit(formState: FormState, formData: FormData): Promise<FormState> {

        try {
            EditAssessmentSchema.parse(Object.fromEntries(formData))
        } catch(error) {
            console.log(error)
            return fromErrorToFormState(error)
        }

        return toFormState("SUCCESS", "")
    }

    return <>
        <Description>Define an assessment:</Description>
        <Form action={submit}>
            <FormField name="date">
                <FieldLabel>Date</FieldLabel>
                <FieldControl>
                    <DatePicker name="date"/>
                </FieldControl>
                <FieldDescription>The date the assessment is being carried out.</FieldDescription>
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
            <FormField name="status">
                <FieldLabel>Status</FieldLabel>
                <FieldControl>
                    <Select name="status">
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
            </FormField>
        </Form>
        <div>{JSON.stringify(params)}</div>
    </>
}
