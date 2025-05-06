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

import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormActions, FormField, FormItem, FormLabel, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamMembershipWithPerson, trpc } from '@/trpc/client'


const removeTeamMemberFormSchema = z.object({
    teamId: z.string().uuid(),
    personId: z.string().uuid(),
    hard: z.boolean()
})


interface RemoveTeamMemberDialogProps {
    teamMembership: TeamMembershipWithPerson
    open: boolean
    onOpenChange: (newValue: boolean) => void
}

export function RemoveTeamMemberDialog({ teamMembership, open, onOpenChange }: RemoveTeamMemberDialogProps) {

    const form = useForm<z.infer<typeof removeTeamMemberFormSchema>>({
        resolver: zodResolver(removeTeamMemberFormSchema),
        defaultValues: {
            teamId: teamMembership.teamId,
            personId: teamMembership.personId,
            hard: false
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()

    const mutation = trpc.teamMemberships.delete.useMutation()

    function handleOpenChange(newValue: boolean) {
        onOpenChange(newValue)
        if(!newValue) form.reset()
    }

    const handleSubmit = form.handleSubmit(async (formData) => {
        await mutation.mutateAsync(formData)
        utils.teamMemberships.byTeam.invalidate({ teamId: teamMembership.teamId })
        toast({
            title: "Team Member Removed",
            description: `${teamMembership.person.name} has been removed from the team.`,
        })
        handleOpenChange(false)
    })

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
            </DialogHeader>
            <Paragraph>Confirm removal of {teamMembership.person.name} from team?</Paragraph>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit}>
                    <FormField 
                        control={form.control}
                        name="hard" 
                        render={({ field }) => 
                            <FormItem className="flex items-center space-y-0 space-x-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="m-0">Hard Delete</FormLabel>
                            </FormItem>
                        }
                    />
                    <FormActions>
                        <FormSubmitButton
                            labels={{
                                ready: "Remove",
                                submitting: "Removing...",
                                submitted: "Removed",
                            }}
                        />
                        <FormCancelButton onClick={() => handleOpenChange(false)}/>
                    </FormActions>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>

}