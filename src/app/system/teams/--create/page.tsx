/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormActions, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamFormData, systemTeamFormSchema } from '@/lib/forms/system-team'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'


export default function CreateTeamPage() {

    const teamId = React.useMemo(() => nanoId8(), [])

    const form = useForm<SystemTeamFormData>({
        resolver: zodResolver(systemTeamFormSchema),
        defaultValues: {
            teamId,
            name: '',
            shortName: '',
            slug: teamId,
            color: '',
        }
    })

    const trpc = useTRPC()
    const router = useRouter()
    const { toast } = useToast()


    const mutation = useMutation(trpc.teams.create.mutationOptions({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SystemTeamFormData, { message: error.shape.message })
            }
        }
    }))

    const handleSubmit = form.handleSubmit(async (data) => {
        const newTeam = await mutation.mutateAsync(data)
     
        toast({
            title: "Team Created",
            description: `Team "${newTeam.name}" created successfully.`,
        })
        router.push(Paths.system.teams.team(newTeam.id).index)
    })

    return <AppPage>
        <AppPageBreadcrumbs
            label="New Team"
            breadcrumbs={[
                { label: 'System', href: Paths.system.index },
                { label: 'Teams', href: Paths.system.teams.index }
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>New Team</PageTitle>
            </PageHeader>
            <FormProvider {...form}>
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className='space-y-4 p-2'>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input maxLength={100} {...field}/>
                                    </FormControl>
                                    <FormDescription>The full name of the team.</FormDescription>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="shortName"
                                render={({ field }) => <FormItem>
                                    <FormLabel>Short name</FormLabel>
                                    <FormControl>
                                        <Input maxLength={20} {...field}/>
                                    </FormControl>
                                    <FormDescription>Short name of the team (eg NZ-RT13).</FormDescription>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => <FormItem>
                                
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <SlugInput {...field} onChange={(ev, newValue) => field.onChange(newValue)}/>
                                    </FormControl>
                                    <FormDescription>URL-friendly identifier for the team.</FormDescription>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => <FormItem>
                                    <FormLabel>Colour</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-xs" maxLength={7} {...field}/>
                                    </FormControl>
                                    <FormDescription>Highlight colour applied to help differentiate from other teams (optional).</FormDescription>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormActions>
                                <FormSubmitButton
                                    labels={{
                                        ready: 'Create',
                                        submitting: 'Creating...',
                                        submitted: 'Created'
                                    }}
                                />
                                <FormCancelButton href={Paths.system.teams.index}/>
                            </FormActions>
                        </form>
                    </CardBody>
                </Card>
            </FormProvider>
        </AppPageContent>
    </AppPage>
    
}