/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { DefaultD4hApiUrl } from '@/lib/d4h-api/common'
import { CreateTeamFormData, createTeamFormSchema } from '@/lib/forms/create-team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function CreateTeamForm() {

    const form = useForm<CreateTeamFormData>({
        resolver: zodResolver(createTeamFormSchema),
        defaultValues: {
            name: '',
            shortName: '',
            slug: '',
            color: '',
            d4hTeamId: '',
            d4hApiUrl: DefaultD4hApiUrl,
            d4hWebUrl: ''
        }
    })

    const router = useRouter()
    const { toast } = useToast()

    const mutation = trpc.teams.createTeam.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof CreateTeamFormData, { message: error.shape.message })
            }
        },
        onSuccess: (newTeam) => {
            toast({
                title: `${newTeam.name} created`,
                description: 'The team has been created successfully.',
            })
            router.push(Paths.config.teams.team(newTeam.slug).index)
        }
    })

    function onSubmit(formData: CreateTeamFormData) {
        mutation.mutate(formData)
    }

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-xl space-y-8'>
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
                        <Input maxLength={100} {...field}/>
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
            <FormField
                control={form.control}
                name="d4hTeamId"
                render={({ field }) => <FormItem>
                    <FormLabel>D4H Team ID</FormLabel>
                    <FormControl>
                        <Input className="max-w-xs" type="number" {...field}/>
                    </FormControl>
                    <FormDescription>D4H Team ID (If known).</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="d4hApiUrl"
                render={({ field }) => <FormItem>
                    <FormLabel>D4H API URL</FormLabel>
                    <FormControl>
                        <Input {...field}/>
                    </FormControl>
                    <FormDescription>Base URL of the D4H Team Manager API for the team.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="d4hWebUrl"
                render={({ field }) => <FormItem>
                    <FormLabel>D4H Web URL</FormLabel>
                    <FormControl>
                        <Input {...field}/>
                    </FormControl>
                    <FormDescription>The Web URL of the D4H Team Manager for the team.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormSubmitButton
                labels={{
                    ready: 'Create',
                    submitting: 'Creating...',
                    submitted: 'Created'
                }}
            />
            <FormCancelButton/>
        </form>
    </FormProvider>
}