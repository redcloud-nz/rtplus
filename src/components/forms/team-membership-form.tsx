/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { ComponentProps, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { Spinner } from '@/components/ui/spinner'

import { PersonRef } from '@/lib/schemas/person'
import { TeamRef } from '@/lib/schemas/team'
import { TeamMembershipData } from '@/lib/schemas/team-membership'





type TeamMembershipFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    form: ReturnType<typeof useForm<TeamMembershipData>>
    membership: TeamMembershipData
    onCancel: () => void
    onSubmit: (data: TeamMembershipData) => Promise<void>
    person: PersonRef
    team: TeamRef
}

export function TeamMembershipForm({ form, membership, onCancel, onSubmit, person, team, ...props }: TeamMembershipFormProps) {

    const [isPending, setIsPending] = useState(false)

    const handleSubmit = form.handleSubmit(async (data) => {
        setIsPending(true)
        await onSubmit(data)
        setIsPending(false)
    })

    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Edit Team Membership</S2_CardTitle>
            <S2_CardDescription><span className="font-medium">{person.name}</span> in <span className="font-medium">{team.name}</span>.</S2_CardDescription>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="update-team-membership" onSubmit={handleSubmit} {...props}>
                <FieldGroup>
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                            >
                                <FieldContent>
                                    <FieldLabel htmlFor="team-membership-status">Status</FieldLabel>
                                    <FieldDescription>The current membership status.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="team-membership-status" className="min-w-1/2">
                                        <S2_SelectValue placeholder="Select status"/>
                                    </S2_SelectTrigger>
                                    <S2_SelectContent>
                                        <S2_SelectItem value="Active">Active</S2_SelectItem>
                                        <S2_SelectItem value="Inactive">Inactive</S2_SelectItem>
                                    </S2_SelectContent>
                                </S2_Select>
                            </Field>
                        }
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit"
                            disabled={!form.formState.isDirty || isPending}
                            form="update-team-membership"
                        >
                            {isPending ? <><Spinner/> Updating...</> : 'Update' }
                        </S2_Button>
                        <S2_Button 
                            type="button"
                            variant="outline" 
                            disabled={isPending} onClick={() => { form.reset(); onCancel() }} 
                        >
                            Cancel
                        </S2_Button>
                    </Field>
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}