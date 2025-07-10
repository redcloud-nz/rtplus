/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue, Form, FormActions, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'
import { ToruGrid, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


export function NewTeamDetailsCard() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const teamId = useMemo(() => nanoId8(), [])

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            teamId: teamId,
            name: '',
            shortName: '',
            slug: teamId,
            color: '',
            status: 'Active'
        }
    })

    const mutation = useMutation(trpc.teams.sys_create.mutationOptions({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamFormData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating team",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Team created",
                description: <>The team <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })
            router.push(Paths.system.team(teamId).index)

            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
        }
    }))

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardBody>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                    <ToruGrid mode='form'>
                        <FormField
                            control={form.control}
                            name="teamId"
                            render={({ field }) => <ToruGridRow
                                label="Team ID"
                                control={ <DisplayValue value={field.value} />}
                                description="The unique identifier for the team."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => <ToruGridRow
                                label="Name"
                                control={<Input maxLength={100} {...field}/>}
                                description="The full name of the team."
        
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="shortName"
                            render={({ field }) => <ToruGridRow
                                label="Short Name"
                                control={<Input maxLength={20} {...field}/>}
                                description="Short name of the team (eg NZ-RT13)."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => <ToruGridRow
                                label="Slug"
                                control={<SlugInput {...field} onChange={(ev, newValue) => field.onChange(newValue)}/>}
                                description="URL-friendly identifier for the team."
                            />}
                        />
                        <FormActions layout="row">
                            <FormSubmitButton labels={SubmitVerbs.create}/>
                            <FormCancelButton onClick={() => router.back()}/>
                        </FormActions>
                    </ToruGrid>
                </Form>
            </FormProvider>
        </CardBody>
    </Card>
}