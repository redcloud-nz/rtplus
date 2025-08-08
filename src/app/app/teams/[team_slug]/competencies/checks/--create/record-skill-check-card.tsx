/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { Fragment, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { CurrentPersonValue } from '@/components/controls/person-value'
import { TeamMemberPicker } from '@/components/controls/team-member-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { nanoId16 } from '@/lib/id'
import { SkillData } from '@/lib/schemas/skill'
import { CompetenceLevelTerms, skillCheckSchema } from '@/lib/schemas/skill-check'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { SkillGroupData } from '@/lib/schemas/skill-group'

import { useTRPC } from '@/trpc/client'



const singleSkillCheckSchema = skillCheckSchema.omit({ assessorId: true, sessionId: true, timestamp: true })


export function RecordSkillCheckCard() {
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()
    
    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getTree.queryOptions())

    const skillCheckId = useMemo(() => nanoId16(), [])

    const form = useForm<z.infer<typeof singleSkillCheckSchema>>({
        resolver: zodResolver(singleSkillCheckSchema),
        defaultValues: {
            skillCheckId,
            skillId: '',
            assesseeId: '',
            result: 'NotAssessed',
            notes: ''
        }
    })

    const mutation = useMutation(trpc.activeTeam.skillChecks.createIndependentSkillCheck.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name === 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof z.infer<typeof singleSkillCheckSchema>, { message: error.shape.message })
            } else {
                toast({
                    title: "Error recording skill check",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess() {
            toast({
                title: "Skill check recorded",
                description: "The skill check has been successfully recorded.",
            })
            router.push(`./`)
        }
    }))

    function renderSkillPackageSelectItems(skillPackage: SkillPackageData & { skillGroups: SkillGroupData[], skills: SkillData[] }) {
        if (skillPackage.skillGroups.length) {
            return <Fragment key={skillPackage.skillPackageId}>
                {skillPackage.skillGroups
                    .filter(skillGroup => skillGroup.parentId == null)
                    .map(skillGroup =>
                    renderSkillGroupSelectItems(skillPackage.name, skillGroup, skillPackage.skills)
                )}
            </Fragment>
        }
    }

    function renderSkillGroupSelectItems(parent: string, skillGroup: SkillGroupData, skills: SkillData[]) {
        return <SelectGroup key={skillGroup.skillGroupId}>
            <SelectLabel>{`${parent} / ${skillGroup.name}`}</SelectLabel>
            {skills
                .filter(skill => skill.skillGroupId == skillGroup.skillGroupId)
                .map(skill => 
                    <SelectItem key={skill.skillId} value={skill.skillId}>{skill.name}</SelectItem>
                )
            }
        </SelectGroup>
    }

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
                            description="The person recording the skill check."
                        />
                        <FormField
                            control={form.control}
                            name="assesseeId"
                            render={({ field }) => <ToruGridRow
                                label="Assessee"
                                control={<TeamMemberPicker 
                                    {...field} 
                                    onValueChange={field.onChange}
                                    placeholder="Select a person to assess..."
                                   size="default" 
                                />}
                                description="The person to assess."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="skillId"
                            render={({ field }) => <ToruGridRow
                                label="Skill"
                                control={
                                    <Select {...field} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a skill to assess..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {skillPackages.map(renderSkillPackageSelectItems)}
                                        </SelectContent>
                                    </Select>
                                }
                                description="The skill to assess."
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
                                description="The level of competence demonstrated."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => <ToruGridRow
                                label="Notes"
                                control={<Textarea {...field} maxLength={500}/>}
                                description="Any additional notes or comments."
                            />}
                        />

                        <ToruGridFooter>
                            <FormSubmitButton labels={SubmitVerbs.save} size="sm"/>
                            <FormCancelButton href="./" size="sm"/>
                        </ToruGridFooter>
                        
                    </ToruGrid>
                </Form>
            </FormProvider>
        </CardContent>
    </Card>
}


