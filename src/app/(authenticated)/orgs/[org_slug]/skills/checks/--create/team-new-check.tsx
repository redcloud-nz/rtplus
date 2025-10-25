/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { DatePicker } from '@/components/controls/date-picker'
import { PersonPicker } from '@/components/controls/person-picker'

import { SkillPicker } from '@/components/controls/skill-picker'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompetenceLevelRadioGroup } from '@/components/ui/competence-level-radio-group'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel } from '@/lib/competencies'
import { nanoId16 } from '@/lib/id'
import { OrganizationData } from '@/lib/schemas/organization'
import { skillCheckSchema } from '@/lib/schemas/skill-check'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { PersonRequireMessage } from '../../person-required-message'




const singleSkillCheckSchema = skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true, date: true })


export function SkillsModule_NewCheck_Form({ organization }: { organization: OrganizationData }) {
    const router = useRouter()
    const { toast } = useToast()

    const { data: currentPerson } = useSuspenseQuery(trpc.personnel.getCurrentPerson.queryOptions({ orgId: organization.orgId }))

    const skillCheckId = useMemo(() => nanoId16(), [])

    const form = useForm<z.infer<typeof singleSkillCheckSchema>>({
        resolver: zodResolver(singleSkillCheckSchema),
        defaultValues: {
            skillCheckId,
            skillId: '',
            assesseeId: '',
            result: '',
            notes: '',
            date: formatISO(new Date(), { representation: 'date' }),
        }
    })

    const mutation = useMutation(trpc.skillChecks.createIndependentSkillCheck.mutationOptions({
        onError(error) {
            toast({
                title: "Error saving skill check",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess() {
            toast({
                title: "Skill check recorded",
                description: "The skill check has been successfully recorded.",
            })
            router.push(Paths.org(organization.slug).skills.checks.href)
        }
    }))

    if(!currentPerson) return <PersonRequireMessage/>

    return <Card>
        <CardHeader>
            <CardTitle>Record Skill Check</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync({ ...formData, orgId: organization.orgId }))}>
                    <ToruGrid mode="form">
                        
                        <ToruGridRow
                            label="Assessor"
                            control={<DisplayValue>{currentPerson.name}</DisplayValue>}
                        />
                        <FormField
                            control={form.control}
                            name="assesseeId"
                            render={({ field }) => <ToruGridRow
                                label="Assessee"
                                control={<PersonPicker
                                    {...field}
                                    onValueChange={({ personId }) => field.onChange(personId)}
                                    placeholder="Select a person to assess..."
                                   size="default" 
                                />}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="skillId"
                            render={({ field }) => <ToruGridRow
                                label="Skill"
                                control={<SkillPicker 
                                    {...field} 
                                    onValueChange={({ skillId }) => field.onChange(skillId)}
                                    placeholder="Select a skill to assess..."
                                />}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="result"
                            render={({ field }) => <ToruGridRow
                                label="Competence Level"
                                control={
                                    <CompetenceLevelRadioGroup
                                        className="py-2"
                                        value={field.value as CompetenceLevel}
                                        prevValue={null}
                                        onValueChange={newValue => field.onChange(newValue)}
                                    />
                                }
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => <ToruGridRow
                                label="Notes"
                                control={<Textarea {...field} maxLength={500}/>}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => <ToruGridRow
                                label="Check Date"
                                control={<DatePicker {...field} />}
                            />}
                        />

                        <ToruGridFooter>
                            <FormSubmitButton labels={SubmitVerbs.save} size="sm"/>
                            <FormCancelButton redirectTo={Paths.org(organization.slug).skills.checks} size="sm"/>
                        </ToruGridFooter>
                        
                    </ToruGrid>
                </Form>
            </FormProvider>
        </CardContent>
    </Card>
}


