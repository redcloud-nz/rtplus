/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamData, teamSchema } from '@/lib/schemas/team'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




export function TeamDetails_Card({ teamId }: { teamId: string }) {
    

    const { data: team } = useSuspenseQuery(trpc.teams.getTeam.queryOptions({ teamId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Show when={team.teamId != 'RT'}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setMode('Update')} disabled={mode == 'Update'}>
                                <PencilIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit team details</TooltipContent>
                    </Tooltip>
                    <DeleteTeamDialog team={team}/>
                </Show>
                <Separator orientation="vertical"/>
                <CardExplanation>
                    This card displays the details of the team and allows you to edit them. You can also delete the team from here.
                </CardExplanation>
            </CardActions>
            
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Team ID"
                            control={<DisplayValue>{team.teamId}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{team.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>{team.status}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                
                )
                .with('Update', () => 
                    <UpdateTeamForm 
                        team={team} 
                        onClose={() => setMode('View')}
                    />
                )
                .exhaustive()
            }
         </CardContent>
    </Card>
}

function UpdateTeamForm({ onClose, team }: { onClose: () => void, team: TeamData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    

    const form = useForm<TeamData>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            ...team
        },
    })

    const mutation = useMutation(trpc.teams.updateTeam.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error updating team",
                    description: error.message,
                    variant: 'destructive',
                })
                onClose()
            }
        },
        onSuccess(result) {
            toast({
                title: "Team updated",
                description: <>The team <ObjectName>{result.name}</ObjectName> has been updated.</>,
            })
            onClose()

            queryClient.invalidateQueries(trpc.teams.getTeam.queryFilter({ teamId: team.teamId }))
            queryClient.invalidateQueries(trpc.teams.getTeams.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
            <ToruGrid mode='form'>
                <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => <ToruGridRow
                        label="Team ID"
                        control={ <DisplayValue>{field.value}</DisplayValue>}
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
                        description="The current status of the team."
                    />}
                />
                <ToruGridFooter>
                    <FormSubmitButton labels={SubmitVerbs.update} size="sm"/>
                    <FormCancelButton onClick={onClose} size="sm"/>
                </ToruGridFooter>
            </ToruGrid>
        </Form>
    </FormProvider>
}


function DeleteTeamDialog({ team }: { team: TeamData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            teamId: zodNanoId8,
            teamName: z.literal(team.name)
        })),
        mode: 'onSubmit',
        defaultValues: { teamId: team.teamId, teamName: "" }
    })

    const mutation = useMutation(trpc.teams.deleteTeam.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting team',
                description: error.message,
                variant: 'destructive'
            })
            setOpen(false)
        },
        onSuccess(result) {
            toast({
                title: 'Team deleted',
                description: <>The team <ObjectName>{result.name}</ObjectName> has been deleted.</>,
            })
            setOpen(false)
            router.push(Paths.admin.teams.href)

            queryClient.invalidateQueries(trpc.teams.getTeams.queryFilter())
            queryClient.setQueryData(trpc.teams.getTeam.queryKey({ teamId: team.teamId }), undefined)
        },
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete team">
            <TrashIcon/>    
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team</DialogTitle>
                <DialogDescription>This will remove the team from RT+ forever (which is a really long time).</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                        <FormItem>
                            <FormLabel>Team</FormLabel>
                            <FormControl>
                                <DisplayValue>{team.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="teamName"
                            render={({ field }) => <FormItem>
                                <FormLabel>Enter name</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="Type the team name to confirm" 
                                        maxLength={100} 
                                        autoComplete="off" 
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormActions>
                            <FormSubmitButton 
                                labels={SubmitVerbs.delete} 
                                color="destructive"
                            />
                            <FormCancelButton onClick={() => setOpen(false)}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>

}