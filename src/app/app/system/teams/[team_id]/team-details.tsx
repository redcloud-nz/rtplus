/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { CableIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { TeamValue } from '@/components/controls/team-value'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'
import { Link } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import * as Paths from '@/paths'
import { TeamBasic, useTRPC } from '@/trpc/client'






export function TeamDetailsCard({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setMode('Update')} disabled={mode == 'Update'}>
                            <PencilIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit team details</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical"/>
            
                <CardMenu title="Team">
                    <DropdownMenuGroup>
                        <DropdownMenuItem disabled asChild>
                            <Link href={Paths.system.team(teamId).d4h}>
                                <CableIcon/> D4H Integration
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </CardMenu>
            </CardActions>
            
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Team ID"
                            control={<DisplayValue>{team.id}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{team.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Short Name"
                            control={<DisplayValue>{team.shortName}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Slug"
                            control={<DisplayValue>{team.slug}</DisplayValue>}
                        />
                        <ToruGridFooter>
                            
                        </ToruGridFooter>
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

function UpdateTeamForm({ onClose, team }: { onClose: () => void, team: TeamBasic }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            teamId: team.id,
            ...team
        },
    })

    const mutation = useMutation(trpc.teams.sys_update.mutationOptions({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamFormData, { message: error.shape.message })
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

            queryClient.invalidateQueries(trpc.teams.byId.queryFilter({ teamId: team.id }))
            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
        }
    }))

    useEffect(() => {
        form.setFocus('name')
    }, [])

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
            <ToruGrid mode='form'>
                <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => <ToruGridRow
                        label="Team ID"
                        control={ <DisplayValue>{team.id}</DisplayValue>}
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
                <ToruGridFooter className="justify-between">
                    <div className="flex items-center gap-2">
                        <FormSubmitButton labels={SubmitVerbs.update} size="sm"/>
                        <FormCancelButton onClick={onClose} size="sm"/>
                    </div>
                    <DeleteTeamDialog teamId={team.id}/>
                </ToruGridFooter>
            </ToruGrid>
        </Form>
    </FormProvider>
}


function DeleteTeamDialog({ teamId }: { teamId: string }) {
    
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [open, setOpen] = useState(false)

    const form = useForm<Pick<TeamFormData, 'teamId'>>({
        resolver: zodResolver(teamFormSchema.pick({ teamId: true })),
        defaultValues: { teamId }
    })

    const mutation = useMutation(trpc.teams.sys_delete.mutationOptions({
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
                description: <>The team <ObjectName>{result.name}</ObjectName> has been deleted successfully.</>,
            })
            setOpen(false)
            router.push(Paths.system.teams.index)

            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
            queryClient.setQueryData(trpc.teams.byId.queryKey({ teamId }), undefined)
        },
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete Team" color="destructive">
                <TrashIcon/>
                <span className="sr-only">Delete Team</span>
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team</DialogTitle>
                <DialogDescription>Permanently delete team?</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                        <FormItem>
                            <FormLabel>Team</FormLabel>
                            <FormControl>
                                <TeamValue teamId={teamId}/>
                            </FormControl>
                        </FormItem>
                        <FormActions>
                            <FormSubmitButton labels={SubmitVerbs.delete} color="destructive"/>
                            <FormCancelButton onClick={() => setOpen(false)}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>

}