/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon } from 'lucide-react'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Link } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Show } from '@/components/show'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useToast } from '@/hooks/use-toast'
import { TeamMembershipFormData, teamMembershipFormSchema } from '@/lib/forms/team-membership'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function TeamMembershipsCard(props: { personId: string}) {

    const teamMembershipsQuery = trpc.teamMemberships.byPerson.useQuery({ personId: props.personId })

    const [addTeamDialogOpen, setAddTeamDialogOpen] = React.useState(false)

    return <Card>
            <CardHeader>
                <CardTitle>Team Memberships</CardTitle>
                <Show when={teamMembershipsQuery.isSuccess}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setAddTeamDialogOpen(true)}>
                                <PlusIcon size={48}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add Team Membership
                        </TooltipContent>
                    </Tooltip>
                </Show>
            </CardHeader>
            <CardContent>
                <Show 
                    when={teamMembershipsQuery.isSuccess}
                    fallback={<div className="space-y-4">
                        <Skeleton className="h-10"/>
                    </div>}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Team</TableHeadCell>
                                <TableHeadCell>Role</TableHeadCell>
                                <TableHeadCell className="w-12"></TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teamMembershipsQuery.data?.map(membership =>
                                <TableRow key={membership.id}>
                                    <TableCell>
                                        <Link href={Paths.system.teams.team(membership.team.id).index} className="hover:underline">
                                            {membership.team.shortName || membership.team.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{membership.role}</TableCell>
                                    <TableCell className="text-right p-0">
                                        <Button variant="ghost" size="icon">
                                            <PencilIcon/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Show>
            </CardContent>
            <AddTeamDialog 
                open={addTeamDialogOpen}
                onOpenChange={setAddTeamDialogOpen}
                personId={props.personId}
            />
        </Card>
}


interface AddTeamDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
    personId: string
}

function AddTeamDialog({ personId, ...props }: AddTeamDialogProps) {

    const teamsQuery = trpc.teams.all.useQuery({}, { enabled: props.open })
    const membershipsQuery = trpc.teamMemberships.byPerson.useQuery({ personId }, { enabled: props.open })

    const form = useForm<TeamMembershipFormData>({
        resolver: zodResolver(teamMembershipFormSchema),
        defaultValues: {
            teamId: '',
            personId,
            role: 'None'
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()
    
    const mutation = trpc.teamMemberships.create.useMutation()

    async function handleClose() {
        if(props.onOpenChange) props.onOpenChange(false)
        form.reset()
    }

    const handleSubmit = form.handleSubmit(async (formData) => {
        const newMembership = await mutation.mutateAsync({ ...formData })
        utils.teamMemberships.byPerson.invalidate({ personId: formData.personId })
        utils.teamMemberships.byTeam.invalidate({ teamId: formData.teamId })
        toast({
            title: "Team membership added",
            description: `${newMembership.person.name} has been added to the ${newMembership.team.name}.`,
        })
        handleClose()
    })

    const teams = teamsQuery.data || []
    const memberships = membershipsQuery.data || []
    const currentTeams = memberships.map(m => m.team.id)

    return <Dialog {...props}>
        <DialogContent loading={teamsQuery.isLoading}>
            <DialogHeader>
                <DialogTitle>Add Team Membership</DialogTitle>
                <DialogDescription>
                    Add a new team membership for this person.
                </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                    <FormField
                        control={form.control}
                        name="teamId"
                        render={({ field }) => <FormItem>
                            <FormLabel>Team</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Team to add..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map(team => 
                                            <SelectItem 
                                                key={team.id} 
                                                value={team.id}
                                                disabled={currentTeams.includes(team.id)}
                                            >{team.name}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>}
                    />
                    <FormActions>
                        <FormSubmitButton
                            labels={{
                                ready: 'Add',
                                submitting: 'Adding...',
                                submitted: 'Added',
                            }}/>
                        <FormCancelButton onClick={handleClose}/>
                    </FormActions>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
}