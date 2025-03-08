/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormCancelButton, FormControl, FormButtons, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'


const createPersonFormSchema = z.object({
    name: z.string().min(5).max(100),
    email: z.string().email(),
})

export type CreatePersonFormData = z.infer<typeof createPersonFormSchema>


interface CreatePersonDialogProps {
    trigger: React.ReactNode
}

export function CreatePersonDialog({ trigger }: CreatePersonDialogProps) {

    const form = useForm<CreatePersonFormData>({
        resolver: zodResolver(createPersonFormSchema),
        defaultValues: {
            name: '',
            email: ''
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()

    const [open, setOpen] = React.useState(false)
    
    const mutation = trpc.person.create.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof CreatePersonFormData, { message: error.shape.message })
            }
        },
        onSuccess: (newPerson) => {
            toast({
                title: "Person created",
                description: `${newPerson.name} has been created successfully.`,
            })
            utils.personnel.invalidate()
            setOpen(false)
        }
    })

    function handleOpenChange(newValue: boolean) {
        setOpen(newValue)
        if(!newValue) form.reset()
    }

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Person</DialogTitle>
                <DialogDescription>

                </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => <FormItem>
                            <FormLabel>Person name</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormDescription>The full name of the person.</FormDescription>
                            <FormMessage/>
                        </FormItem>}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormDescription>The email of the user (must be unique).</FormDescription>
                            <FormMessage/>
                        </FormItem>}
                    />
                    <FormButtons>
                        <FormSubmitButton
                            labels={{
                                ready: 'Create',
                                submitting: 'Creating...',
                                submitted: 'Created'
                            }}
                        />
                        <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    </FormButtons>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
    
    
}