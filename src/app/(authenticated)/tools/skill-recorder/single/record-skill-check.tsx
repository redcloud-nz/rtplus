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
import { useMutation } from '@tanstack/react-query'

import { DatePicker } from '@/components/controls/date-picker'
import { CurrentPersonValue } from '@/components/controls/person-value'
import { SkillPicker } from '@/components/controls/skill-picker'
import { TeamMemberPicker } from '@/components/controls/team-member-picker'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useActiveTeam } from '@/hooks/use-active-team'
import { useToast } from '@/hooks/use-toast'
import { CompetenceLevelTerms } from '@/lib/competencies'
import { nanoId16 } from '@/lib/id'
import { skillCheckSchema } from '@/lib/schemas/skill-check'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



const singleSkillCheckSchema = skillCheckSchema.omit({ assessorId: true, sessionId: true })


export function CompetencyRecorder_Single_Card() {
    const router = useRouter()
    const { toast } = useToast()

    const activeTeam = useActiveTeam()!

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
            router.push(Paths.tools.skillRecorder.href)
        }
    }))

    return <Card>
        <CardHeader>
            <CardTitle>Record Skill Check</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))}>
                    <ToruGrid mode="form">
                        
                        <ToruGridRow
                            label="Assessor"
                            control={<CurrentPersonValue/>}
                        />
                        <FormField
                            control={form.control}
                            name="assesseeId"
                            render={({ field }) => <ToruGridRow
                                label="Assessee"
                                control={<TeamMemberPicker 
                                    {...field} 
                                    teamId={activeTeam.teamId}
                                    onValueChange={field.onChange}
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
                                    <Select {...field} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select competence level ..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                             {Object.entries(CompetenceLevelTerms).map(([key, label]) =>
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
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
                            <FormCancelButton redirectTo={Paths.tools.skillRecorder} size="sm"/>
                        </ToruGridFooter>
                        
                    </ToruGrid>
                </Form>
            </FormProvider>
        </CardContent>
    </Card>
}


