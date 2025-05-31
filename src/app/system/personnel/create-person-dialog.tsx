/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DebugFormState, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { systemPersonFormSchema } from '@/lib/forms/system-person'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function CreatePersonDialog({ trigger }: { trigger: ReactNode }) {

    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Person</DialogTitle>
                <DialogDescription>
                    Create a new person in the system.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                { open ? <CreatePersonForm onClose={() => setOpen(false)}/> : null }
            </DialogBody>
        </DialogContent>
    </Dialog>  
}


const createPersonFormSchema = systemPersonFormSchema.omit({ personId: true, status: true })
type CreatePersonFormData = z.infer<typeof createPersonFormSchema>


function CreatePersonForm({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const form = useForm<CreatePersonFormData>({
        resolver: zodResolver(createPersonFormSchema),
        defaultValues: {
            name: '',
            email: ''
        }
    })

    const { toast } = useToast()
    const router = useRouter()

    const mutation = useMutation(trpc.personnel.create.mutationOptions({
        onError(error) {
            console.error(error)
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof CreatePersonFormData, { message: error.shape.message })
            }
        },
        onSuccess(newPerson) {
            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
            toast({
                title: 'Person created',
                description: `${newPerson.name} has been created successfully.`,
            })
            onClose()
            router.push(Paths.system.personnel.person(newPerson.id).index)
        }
    }))

    async function handleClose() {
        onClose()
        form.reset()
    }

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => <FormItem>
                    <FormLabel>Name</FormLabel>
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
            <FormActions>
                <FormSubmitButton
                    labels={{
                        ready: 'Create',
                        submitting: 'Creating...',
                        submitted: 'Created'
                    }}
                />
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
            
        </form>
    </FormProvider>
}