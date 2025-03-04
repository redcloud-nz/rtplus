/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Team, TeamD4hInfo } from '@prisma/client'


import { FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { UpdateTeamD4hFormData, updateTeamD4hFormSchema } from '@/lib/forms/update-team-d4h'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



interface UpdateTeamD4hFormProps {
    team: Team
    d4hInfo: Pick<TeamD4hInfo, 'd4hTeamId' | 'd4hApiUrl' | 'd4hWebUrl'> | null
}

export function UpdateTeamD4hForm({ team, d4hInfo }: UpdateTeamD4hFormProps) {
    const utils = trpc.useUtils()

    const form = useForm<UpdateTeamD4hFormData>({
        resolver: zodResolver(updateTeamD4hFormSchema),
        defaultValues: d4hInfo ?? {
            teamId: team.id,
            d4hTeamId: 0,
            d4hApiUrl: '',
            d4hWebUrl: '',
        },
    })

    const router = useRouter()

    const mutation = trpc.teams.updateTeamD4h.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof UpdateTeamD4hFormData, { message: `Team ${error.shape.cause.message} is already taken.` })
            }
        },
        onSuccess: () => {
            utils.teams.invalidate()
            router.push(Paths.config.teams.team(team.slug).index)
        }
    })

    function onSubmit(formData: UpdateTeamD4hFormData) {
        mutation.mutate(formData)
    }

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-8">
            <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => <Input type="hidden" {...field}/>}
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
                    ready: 'Update',
                    submitting: 'Updating...',
                    submitted: 'Updated'
                }}
            />
            <FormCancelButton/>
        </form>
    </FormProvider>
}