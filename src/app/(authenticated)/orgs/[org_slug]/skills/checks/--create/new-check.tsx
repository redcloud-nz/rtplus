/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { MoveLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useSuspenseQueries,  } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { SkillSelectContent } from '@/components/controls/skill-select'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { CompetenceLevelRadioGroup } from '@/components/controls/competence-level-radio-group'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { S2_Textarea } from '@/components/ui/s2-textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { S2_Value } from '@/components/ui/s2-value'

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

    const [
        { data: currentPerson }, 
        { data: personnel }, 
        { data: skillPackages }
    ] = useSuspenseQueries({
        queries: [
            trpc.personnel.getCurrentPerson.queryOptions({ orgId: organization.orgId }),
            trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }),
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            
        ]
    })

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

    return <>
        <Lexington.TableControls>
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button variant="outline" asChild>
                        <Link to={Paths.org(organization.slug).skills.checks}>
                            <MoveLeftIcon/> List
                        </Link>
                    </S2_Button>
                </TooltipTrigger>
                <TooltipContent>
                    back to list
                </TooltipContent>
            </Tooltip>
        </Lexington.TableControls>
        <S2_Card>
            <S2_CardHeader>
                <S2_CardTitle>Record Skill Check</S2_CardTitle>
                <S2_CardDescription>Fill out the form below to record a single skill check.</S2_CardDescription>
            </S2_CardHeader>
            <S2_CardContent>
                <form id="record-skill-check-form" onSubmit={form.handleSubmit((formData) => mutation.mutateAsync({ ...formData, orgId: organization.orgId }))}>
                <FieldGroup>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldContent>
                                <FieldLabel html-for="form-check-assessorId">Assessor</FieldLabel>
                                <FieldDescription>The person performing the assessment.</FieldDescription>
                            </FieldContent>
                            <S2_Value id="form-check-assessorId" className='min-w-2xs border-1 border-input' value={currentPerson.name}/>
                        </Field>
                        <Controller
                            name="assesseeId"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                >
                                    <FieldContent>
                                        <FieldLabel html-for="form-check-assesseeId">Assessee</FieldLabel>
                                        <FieldDescription>The person being assessed.</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    
                                    <S2_Select 
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <S2_SelectTrigger
                                            id="form-check-assesseeId"
                                            aria-invalid={fieldState.invalid}
                                            className="min-w-2xs"
                                            autoFocus
                                        >
                                            <S2_SelectValue placeholder="Select a person to assess..."/>
                                        </S2_SelectTrigger>
                                        <S2_SelectContent>
                                            {personnel.map(person => (
                                                <S2_SelectItem key={person.personId} value={person.personId}>
                                                    {person.name}
                                                </S2_SelectItem>
                                            ))}
                                        </S2_SelectContent>
                                        
                                    </S2_Select>
                                    
                                </Field>
                            }
                        />
                        <Controller
                            name="skillId"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                >
                                    <FieldContent>
                                        <FieldLabel html-for="form-check-skillId">Skill</FieldLabel>
                                        <FieldDescription>The skill being assessed.</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    <S2_Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <S2_SelectTrigger
                                            id="form-check-skillId"
                                            aria-invalid={fieldState.invalid}
                                            className="min-w-2xs"
                                        >
                                            <S2_SelectValue placeholder="Select a skill to assess..."/>
                                        </S2_SelectTrigger>
                                        <SkillSelectContent skillPackages={skillPackages}/>
                                    </S2_Select>
                                </Field>
                            }
                        />
                    </FieldGroup>

                    <FieldSeparator/>

                    <FieldGroup>
                        <Controller
                            name="result"
                            control={form.control}
                            render={({ field, fieldState}) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                >
                                    <FieldContent>
                                        <FieldLabel html-for="form-check-result">Competence Level</FieldLabel>
                                        <FieldDescription>The assessed competence level for the skill.</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    <CompetenceLevelRadioGroup
                                        id="form-check-result"
                                        aria-invalid={fieldState.invalid}
                                        value={field.value as CompetenceLevel}
                                        prevValue={null}
                                        onValueChange={newValue => field.onChange(newValue)}
                                    />
                                    
                                </Field>
                            }
                        />
                        <Controller
                            name="notes"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                >
                                    <FieldContent>
                                        <FieldLabel html-for="form-check-notes">Notes</FieldLabel>
                                        <FieldDescription>Additional notes regarding the skill check (optional).</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    <S2_Textarea 
                                        aria-invalid={fieldState.invalid}
                                        id="form-check-notes" 
                                        className="min-w-2xs" 
                                        {...field}
                                    />
                                </Field>
                            }
                        />
                    </FieldGroup>

                    <FieldSeparator/>

                    <FieldGroup className="flex flex-row justify-start gap-2">
                        <S2_Button type="submit" disabled={!form.formState.isDirty || mutation.isPending} form="record-skill-check-form">
                            Submit
                        </S2_Button>
                        <S2_Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => {
                            form.reset()
                            router.push(Paths.org(organization.slug).skills.checks.href)
                        }}>
                            Cancel
                        </S2_Button>
                    </FieldGroup>
                </FieldGroup>
                </form>
            </S2_CardContent>
        </S2_Card>
    </>
}


