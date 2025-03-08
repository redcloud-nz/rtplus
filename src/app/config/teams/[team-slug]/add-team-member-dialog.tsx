/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormButtons, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/trpc/client'


const addTeamMemberFormSchema = z.object({
    personId: z.string().uuid(),
    role: z.enum(['Admin', 'Member', 'None'])
})

type AddTeamMemberFormData = z.infer<typeof addTeamMemberFormSchema>


interface AddTeamMemberDialogProps {
    teamId: string
    trigger: React.ReactNode
}

export function AddTeamMemberDialog({ teamId, trigger }: AddTeamMemberDialogProps) {

    const [personnel] = trpc.personnel.all.useSuspenseQuery()
    const [members] = trpc.teamMemberships.byTeam.useSuspenseQuery({ teamId })

    const form = useForm<AddTeamMemberFormData>({
        resolver: zodResolver(addTeamMemberFormSchema),
        defaultValues: {
            personId: '',
            role: 'None'
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()

    const [open, setOpen] = React.useState(false)
    
    const mutation = trpc.teamMemberships.create.useMutation()

    async function handleOpenChange(newValue: boolean) {
        setOpen(newValue)
        if(!newValue) {
            form.reset()
        }
    }

    const handleSubmit = form.handleSubmit(async (formData) => {
        const newMember = await mutation.mutateAsync({ teamId, ...formData })
        utils.teamMemberships.byTeam.invalidate({ teamId })
        toast({
            title: "Team member added",
            description: `${newMember.person.name} has been added to the team.`,
        })
        handleOpenChange(false)
    })
    
    return <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                    Add a new team member to this team.
                </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                    <FormField
                        control={form.control}
                        name="personId"
                        render={({ field }) => <FormItem>
                            <FormLabel>Person</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Person to add..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {personnel.map(person => 
                                            <SelectItem 
                                                key={person.id} 
                                                value={person.id}
                                                disabled={members.some(member => member.person.id == person.id)}
                                            >{person.name}</SelectItem>
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
                    <FormButtons>
                        <FormSubmitButton
                            labels={{
                                ready: 'Add',
                                submitting: 'Adding...',
                                submitted: 'Added',
                            }}/>
                        <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    </FormButtons>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
}