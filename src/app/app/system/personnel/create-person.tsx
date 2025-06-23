/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/person'
import { nanoId8 } from '@/lib/id'
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


function CreatePersonForm({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const personId = nanoId8()

    const form = useForm<SystemPersonFormData>({
        resolver: zodResolver(systemPersonFormSchema),
        defaultValues: {
            personId,
            name: '',
            email: '',
            status: 'Active',
        }
    })

    async function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.personnel.sys_create.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SystemPersonFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error creating person',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        async onSuccess(newPerson) {
            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
            
            toast({
                title: 'Person created',
                description: `${newPerson.name} has been created successfully.`,
            })

            handleClose()
            router.push(Paths.system.personnel.person(newPerson.id).index)
        }
    }))

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
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
            
        </form>
    </FormProvider>
}