/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'


import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Team } from '@prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'

import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormActions, FormField, FormItem, FormLabel, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/trpc/client'


const deleteTeamFormSchema = z.object({
    teamId: z.string().uuid(),
    hard: z.boolean()
})

interface DeleteTeamDialogProps {
    team: Team
    open: boolean
    onOpenChange: (newValue: boolean) => void
}

export function DeleteTeamDialog({ team, open, onOpenChange }: DeleteTeamDialogProps) {

    const form = useForm<z.infer<typeof deleteTeamFormSchema>>({
        resolver: zodResolver(deleteTeamFormSchema),
        defaultValues: {
            teamId: team.id,
            hard: false
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()

    const mutation = trpc.teams.delete.useMutation()

    function handleOpenChange(newValue: boolean) {
        onOpenChange(newValue)
        if(!newValue) form.reset()
    }

    const handleSubmit = form.handleSubmit(async (formData) => {
        await mutation.mutateAsync(formData)
        utils.teams.all.invalidate()
        
        toast({
            title: 'Team deleted',
            description: `Team ${team.name} has been deleted.`,
        })
        handleOpenChange(false)
    })

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team</DialogTitle>
            </DialogHeader>
            <Paragraph>Confirm deletion of {team.name}?</Paragraph>
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