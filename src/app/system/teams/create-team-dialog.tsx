/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { FormControl, FormActions, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input, SlugInput } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { createRandomSlug } from '@/lib/id'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


interface CreateTeamDialogProps {
    trigger: React.ReactNode
}


export function CreateTeamDialog({ trigger }: CreateTeamDialogProps) {

    const defaultSlug = React.useMemo(() => createRandomSlug(), [])

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            name: '',
            shortName: '',
            slug: defaultSlug,
            color: '',
        }
    })

    const router = useRouter()
    const { toast } = useToast()
    const utils = trpc.useUtils()

    const [open, setOpen] = React.useState(false)

    const mutation = trpc.teams.create.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamFormData, { message: error.shape.message })
            }
        }
    })

    function handleOpenChange(newValue: boolean = false) {
        setOpen(newValue)
        if(!newValue) form.reset()
    }

    const handleSubmit = form.handleSubmit(async (data) => {
        const newTeam = await mutation.mutateAsync(data)
        utils.teams.invalidate()
        toast({
            title: "Team Created",
            description: `Team "${newTeam.name}" created successfully.`,
        })
        handleOpenChange(false)
        router.push(Paths.system.teams.team(newTeam.slug).index)
    })

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
            </DialogHeader>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit} className='max-w-xl space-y-8'>
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
                        <FormSubmitButton
                            labels={{
                                ready: 'Create',
                                submitting: 'Creating...',
                                submitted: 'Created'
                            }}
                        />
                        <FormCancelButton onClick={() => handleOpenChange(false)}/>
                    </FormActions>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
    
}