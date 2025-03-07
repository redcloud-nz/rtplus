/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { CreatePersonFormData, createPersonFormSchema } from '@/lib/forms/create-person'
import { trpc } from '@/trpc/client'


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
    
    const mutation = trpc.personnel.create.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof CreatePersonFormData, { message: error.shape.message })
            }
        },
        onSuccess: (newPerson) => {
            toast({
                title: `${newPerson.name} created`,
                description: 'The person has been created successfully.',
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
                <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-8">
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
                    <FormSubmitButton
                        labels={{
                            ready: 'Create',
                            submitting: 'Creating...',
                            submitted: 'Created'
                        }}
                    />
                    <FormCancelButton/>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
    
    
}