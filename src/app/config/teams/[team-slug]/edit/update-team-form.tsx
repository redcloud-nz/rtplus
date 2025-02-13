/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Team } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { UpdateTeamFormData, updateTeamFormSchema } from '@/lib/forms/update-team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


interface UpdateTeamFormProps {
    team: Team
}

export function UpdateTeamForm({ team }: UpdateTeamFormProps) {

    const form = useForm<UpdateTeamFormData>({
        resolver: zodResolver(updateTeamFormSchema),
        defaultValues: {
            ...team,
            d4hTeamId: team.d4hTeamId || '',
        },
    })

    const router = useRouter()
    const { toast } = useToast()

    const mutation = trpc.teams.updateTeam.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof UpdateTeamFormData, { message: `Team ${error.shape.cause.message} is already taken.` })
            }
        },
        onSuccess: (updatedTeam) => {
            toast({
                title: `${updatedTeam.name} updated`,
                description: 'The team has been updated successfully.',
            })
            router.push(Paths.config.teams.team(updatedTeam.slug).index)
        }
    })

    function onSubmit(formData: UpdateTeamFormData) {
        mutation.mutate(formData)
    }

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-8">
            <FormField
                control={form.control}
                name="id"
                render={({ field }) => <Input type="hidden" {...field}/>}
            />
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
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </form>
    </FormProvider>
}