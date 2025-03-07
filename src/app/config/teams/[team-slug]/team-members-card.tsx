/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FormControl, FormControls, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


interface TeamMembersCardProps {
    teamId: string
}


export function TeamMembersCard({ teamId }: TeamMembersCardProps) {
    const teamMembershipsQuery = trpc.teams.membersById.useQuery({ teamId })

    return <Card loading={teamMembershipsQuery.isLoading}>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <AddTeamMemberDialog
                teamId={teamId}
                trigger={<DialogTrigger asChild>
                        <Button variant="ghost"><PlusIcon/></Button>
                </DialogTrigger>}
            />
            
        </CardHeader>
        <CardContent>
            { teamMembershipsQuery.isSuccess ? <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Position</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {teamMembershipsQuery.data.map(membership =>
                         <TableRow key={membership.id}>
                            <TableCell>
                                <Link href={Paths.config.personnel.person(membership.person.id).index}>{membership.person.name}</Link>
                            </TableCell>
                            <TableCell>{membership.d4hInfo?.position}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table> : null}
        </CardContent>
    </Card>
}


const addTeamMemberFormSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
})

type AddTeamMemberFormData = z.infer<typeof addTeamMemberFormSchema>

interface AddTeamMemberDialogProps {
    teamId: string
    trigger: React.ReactNode
}


function AddTeamMemberDialog({ teamId, trigger }: AddTeamMemberDialogProps) {

    const form = useForm<AddTeamMemberFormData>({
        resolver: zodResolver(addTeamMemberFormSchema),
        defaultValues: {
            name: '',
            email: '',
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()

    const [open, setOpen] = React.useState(false)
    const [result, setResult] = React.useState<{ status: 'AddedPersonAndMember' | 'PersonAlreadyExists' | 'MemberAlreadyExists', personId: string, personName?: string } | null>(null)
    
    const newPersonMutation = trpc.teams.addMember_NewPerson.useMutation()
    const existingPersonMutation =trpc.teams.addMember_ExistingPerson.useMutation()

    async function handleOpenChange(newValue: boolean) {
        setOpen(newValue)
        if(!newValue) {
            form.reset()
            setResult(null)
        }
    }

    async function handleSubmit(formData: AddTeamMemberFormData) {
        const mutateResult = await newPersonMutation.mutateAsync({ teamId, ...formData })
        setResult(mutateResult)
        if(mutateResult.status == 'AddedPersonAndMember') {
            await utils.teams.membersById.invalidate({ teamId })
            handleOpenChange(false)
            toast({
                title: `${mutateResult.personName} added`,
                description: 'Person and team membership added successfully.',
            })
        }
    }

    async function handleAddExistingPerson() {
        if(result == null) return
        await existingPersonMutation.mutateAsync({ teamId, personId: result.personId })
        await utils.teams.membersById.invalidate({ teamId })
        handleOpenChange(false)
        toast({
            title: `${result.personName} added`,
            description: 'Team membership added successfully.',
        })
    }
    
    return <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                    Add a new team member to this team.
                </DialogDescription>
            </DialogHeader>
            { result == null
                ? <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xl space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} type="text" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormControls>
                            <FormSubmitButton labels={{
                                ready: 'Add',
                                submitting: 'Adding...',
                                submitted: 'Added',
                            }}/>
                            <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        </FormControls>
                    </form>
                </FormProvider>
                : result.status == 'PersonAlreadyExists'
                    ? <div>
                        <p> A person name "{result.personName}"" already exists with that email address, would you like to add them as a team member?</p>
                        <AsyncButton onClick={handleAddExistingPerson}>Add </AsyncButton>
                    </div>
                : result.status == 'MemberAlreadyExists'
                    ? <p>A person with that email address is already a member of this team.</p>
                : null
            }
            
        </DialogContent>
    </Dialog>
}