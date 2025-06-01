/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'

import { Card, CardActionButton, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'

import { SystemTeamFormData, systemTeamFormSchema } from '@/lib/forms/system-team'
import { useToast } from '@/hooks/use-toast'
import { useTRPC } from '@/trpc/client'



export function TeamDetailsCard({ teamId }: { teamId: string }) {
    const [mode, setMode] = React.useState<'View' | 'Edit'>('View')

    return <Card boundary fallbackHeader={<CardHeader>
        <CardTitle>Details</CardTitle>
    </CardHeader>}>
        <CardHeader>
            <CardTitle>Team Details</CardTitle>
            <Show when={mode == 'View'}>
                <CardActionButton
                    icon={<PencilIcon/>}
                    label="Edit"
                    onClick={() => setMode('Edit')}
                />
            </Show>
        </CardHeader>
        <CardBody>
            { mode == 'View'
                ? <TeamDetailsList teamId={teamId}/>
                : <EditTeamForm teamId={teamId} onClose={() => setMode('View')}/>
            }
        </CardBody>
    </Card>
}

function TeamDetailsList({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    if(team == null) throw new Error(`Team(${teamId}) not found`)

    return <DL>
        <DLTerm>RT+ ID</DLTerm>
        <DLDetails>{team.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{team.name}</DLDetails>

        <DLTerm>Short Name</DLTerm>
        <DLDetails>{team.shortName}</DLDetails>

        <DLTerm>Slug</DLTerm>
        <DLDetails>{team.slug}</DLDetails>

        <DLTerm>Colour</DLTerm>
        <DLDetails>{team.color ? <ColorValue value={team.color}/> : null}</DLDetails>

        <DLTerm>Status</DLTerm>
        <DLDetails>{team.status}</DLDetails>

        {/* {team.d4hInfo?.serverCode ? <>
            <DLTerm>D4H Server</DLTerm>
            <DLDetails>{getD4hServer(team.d4hInfo.serverCode as D4hServerCode).name}</DLDetails>
        </> : null}
        {team.d4hInfo?.d4hTeamId ? <>
            <DLTerm>D4H Team ID</DLTerm>
            <DLDetails>{team.d4hInfo.d4hTeamId}</DLDetails>
        </> : null} */}
    </DL>
}



function EditTeamForm({ teamId, onClose }: { teamId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    if(team == null) throw new Error(`Team(${teamId}) not found`)

    const form = useForm<SystemTeamFormData>({
        resolver: zodResolver(systemTeamFormSchema),
        defaultValues: {
            ...team
        }
    })

    const { toast } = useToast()

    const mutation = useMutation(trpc.teams.update.mutationOptions({
        onError: (error) => {
            console.error('Error updating team:', error)
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SystemTeamFormData, { message: error.shape.message })
            }
        },
        onSuccess: async (updatedTeam) => {
            await queryClient.invalidateQueries(
                trpc.teams.byId.queryFilter({ teamId: updatedTeam.id }), 
            )
            await queryClient.invalidateQueries(
                trpc.teams.all.queryFilter()
            )
            toast({
                title: "Team updated",
                description: `${updatedTeam.name} has been updated.`,
            })
            onClose()
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="space-y-4">
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
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}