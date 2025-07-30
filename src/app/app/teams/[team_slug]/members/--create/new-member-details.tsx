/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, TagsInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import {personSchema } from '@/lib/schemas/person'
import { teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



const formSchema = personSchema.pick({ name: true, email: true }).merge(teamMembershipSchema.pick({ tags: true, status: true }))

type FormData = z.infer<typeof formSchema>

export function NewMemberDetailsCard() {
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
            status: 'Active'
        }
    })

    const mutation = useMutation(trpc.activeTeam.members.createWithPerson.mutationOptions({
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
            queryClient.invalidateQueries(trpc.activeTeam.members.all.queryFilter({}))
            toast({
                title: "Membership Created",
                description: `${result.person.name} has been added to the team.`,
            })
            router.push(Paths.team(result.team.slug).members.index)
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
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => <ToruGridRow
                                label="Tags"
                                control={ <TagsInput value={field.value} onValueChange={field.onChange} placeholder="Add tags"/>}
                                description="Tags can be used to categorize or label the membership for easier searching and filtering."
                            />}
                        />
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