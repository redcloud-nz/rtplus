/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { MoveLeftIcon } from 'lucide-react'
import { ComponentProps, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Lexington } from '@/components/blocks/lexington'

import { S2_DatePicker } from '@/components/controls/s2-date-picker'
import { S2_Textarea } from '@/components/ui/s2-textarea'
import { S2_Input } from '@/components/ui/s2-input'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { S2_Value } from '@/components/ui/s2-value'

import { SkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'



type SessionFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    cancelPath: { href: string }
    listPath: { href: string }
    onSubmit: (data: SkillCheckSessionData) => Promise<void>
    session: SkillCheckSessionData
}

export function SkillsModule_SessionForm({ cancelPath, className, id: formId = "skill-check-session-form", listPath,  onSubmit, session,...props }: SessionFormProps) {
    
    const form = useForm<SkillCheckSessionData>({
        resolver: zodResolver(skillCheckSessionSchema),
        defaultValues: { ...session }
    })

    const [isPending, setIsPending] = useState(false)

    const handleSubmit = form.handleSubmit(async (data) => {
        setIsPending(true)
        await onSubmit(data)
        form.reset(data)
        setIsPending(false)
    })
    
    return <>
        <Lexington.TableControls>
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button variant="outline" asChild>
                        <Link to={listPath}>
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
                <S2_CardTitle>Create New Skill Check Session</S2_CardTitle>
            </S2_CardHeader>
            <S2_CardContent>
                <form id="skill-check-session-form" onSubmit={handleSubmit} className={className} {...props}>
                    <FieldGroup>
                        <Controller
                            name="sessionId"
                            control={form.control}
                            render={({ field }) => <Field orientation="responsive">
                                <FieldContent>
                                    <FieldLabel htmlFor="session-id">Session ID</FieldLabel>
                                    <FieldDescription>The unique identifier for this session.</FieldDescription>
                                </FieldContent>
                                <S2_Value id="session-id" className='min-w-2xs' value={field.value} />
                            </Field>}
                        />
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                >
                                    <FieldContent>
                                        <FieldLabel htmlFor="session-name">Name</FieldLabel>
                                        <FieldDescription>The name of the skill check session.</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    <S2_Input
                                        aria-invalid={fieldState.invalid}
                                        id="session-name"
                                        className='min-w-2xs'
                                        maxLength={100}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    
                                </Field>
                            }
                        />
                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                >
                                    <FieldContent>
                                        <FieldLabel htmlFor="session-date">Date</FieldLabel>
                                        <FieldDescription>The date when the session takes place.</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    <S2_DatePicker
                                        aria-invalid={fieldState.invalid}
                                        id="session-date"
                                        className='min-w-2xs'
                                        value={field.value}
                                        onValueChange={field.onChange}
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
                                        <FieldLabel htmlFor="session-notes">Notes</FieldLabel>
                                        <FieldDescription>Additional notes about the session.</FieldDescription>
                                        { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                    </FieldContent>
                                    <S2_Textarea
                                        aria-invalid={fieldState.invalid}
                                        id="session-notes"
                                        className='min-w-2xs'
                                        maxLength={500} {...field}
                                    />
                                </Field>
                            }
                        />

                        <Field orientation="horizontal">
                            <S2_Button type="submit" disabled={!form.formState.isDirty || isPending} form="new-skill-check-session-form">
                                Save
                            </S2_Button>
                            <S2_Button type="button" variant="outline" disabled={isPending} onClick={() => form.reset() } asChild>
                                <Link to={cancelPath}>
                                    Cancel
                                </Link>
                            </S2_Button>
                        </Field>

                    </FieldGroup>
                    
                </form>
            </S2_CardContent>
        </S2_Card>
    </>
}