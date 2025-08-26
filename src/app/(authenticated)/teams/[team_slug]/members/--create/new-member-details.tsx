/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, TagsInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { sandboxEmailOf } from '@/lib/sandbox'
import {personSchema } from '@/lib/schemas/person'
import { TeamData } from '@/lib/schemas/team'
import { teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'







const formSchema = personSchema.pick({ name: true, email: true }).merge(teamMembershipSchema.pick({ teamId: true, tags: true, status: true }))

type FormData = z.infer<typeof formSchema>

export function Team_NewMember_Details_Card({ team, showTags }: { team: TeamData, showTags: boolean }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            tags: [],
            status: 'Active',
            teamId: team.teamId,
        }
    })

    const mutation = useMutation(trpc.teamMemberships.createLinkedTeamMembership.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name === 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof FormData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating membership",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Membership Created",
                description: `${result.person.name} has been added to the team.`,
            })
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ teamId: result.teamId }))
            router.push(Paths.team(result.team.slug).members.href)
        }
    }))

    return <Card>
        <CardHeader>
            <CardTitle>New Team Member</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit((formData) => mutation.mutate(formData))}>
                    <ToruGrid mode="form">
                        {match(team.type)
                            .with('Normal', () => <>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => <ToruGridRow
                                        label="Name"
                                        control={<Input maxLength={100} {...field}/>}
                                        description="The full name of the person."
                                    />}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => <ToruGridRow
                                        label="Email"
                                        control={<Input type="email" maxLength={100} {...field}/>}
                                        description="The email address of the person (must be unique)."
                                    />}
                                />
                            </>)
                            .with('Sandbox', () => <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => <>
                                    <ToruGridRow
                                        label="Name"
                                        control={<Input maxLength={100} {...field}/>}
                                        description="The full name of the person."
                                    />
                                    <ToruGridRow
                                        label="Email"
                                        control={<DisplayValue>{sandboxEmailOf(field.value)}</DisplayValue>}
                                        description="The email address of the person."
                                    />
                                </>}
                            />)
                            .with('System', () => <Alert title="NOT PERMITTED"/>)
                            .exhaustive()
                        }
                        <Show when={showTags}>
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => <ToruGridRow
                                    label="Tags"
                                    control={ <TagsInput value={field.value} onValueChange={field.onChange} placeholder="Add tags"/>}
                                    description="Tags can be used to categorize or label the membership for easier searching and filtering."
                                />}
                            />
                        </Show>
                        
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => <ToruGridRow
                                label="Status"
                                control={
                                    <Select {...field} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                }
                                description="The current status of the membership."
                            />}
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