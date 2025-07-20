/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useLayoutEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamData, teamSchema } from '@/lib/schemas/team'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function NewTeamDetailsCard() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const teamId = useMemo(() => nanoId8(), [])

    const form = useForm<TeamData>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            teamId: teamId,
            name: '',
            shortName: '',
            slug: teamId,
            color: '',
            status: 'Active'
        }
    })

    const mutation = useMutation(trpc.teams.create.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamData, { message: error.shape.message })
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

            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
            router.push(Paths.system.team(teamId).index)
        }
    }))

    useLayoutEffect(() => {
        form.setFocus('name')
    }, [])

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                    <ToruGrid mode='form'>
                        <FormField
                            control={form.control}
                            name="teamId"
                            render={({ field }) => <ToruGridRow
                                label="Team ID"
                                control={ <DisplayValue>{field.value}</DisplayValue>}
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
                                control={<SlugInput {...field} onValueChange={field.onChange}/>}
                                description="URL-friendly identifier for the team."
                            />}
                        />
                         <ToruGridRow
                            label="Status"
                            control={<DisplayValue>Active</DisplayValue>}
                        />
                        <ToruGridFooter>
                            <FormSubmitButton labels={SubmitVerbs.create} size="sm"/>
                            <FormCancelButton onClick={() => router.back()} size="sm"/>
                        </ToruGridFooter>
                    </ToruGrid>
                </Form>
            </FormProvider>
        </CardContent>
    </Card>
}