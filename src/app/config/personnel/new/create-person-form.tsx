/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { CreatePersonFormData, createPersonFormSchema } from '@/lib/forms/create-person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export function CreatePersonForm() {


    const form = useForm<CreatePersonFormData>({
        resolver: zodResolver(createPersonFormSchema),
        defaultValues: {
            name: '',
            email: ''
        }
    })

    const router = useRouter()
    const utils = trpc.useUtils()
    const { toast } = useToast()
    
    const mutation = trpc.personnel.createPerson.useMutation({
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
            router.push(Paths.config.personnel.person(newPerson.id).index)
        }
    })

    return <FormProvider {...form}>
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
}