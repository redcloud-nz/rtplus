/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormActions, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


const newPersonFormSchema = z.object({
    name: z.string().min(5).max(100),
    email: z.string().email(),
})

export type NewPersonFormData = z.infer<typeof newPersonFormSchema>


export default function NewPersonPage() {

    const form = useForm<NewPersonFormData>({
        resolver: zodResolver(newPersonFormSchema),
        defaultValues: {
            name: '',
            email: ''
        }
    })

    const router = useRouter()
    const { toast } = useToast()
    const utils = trpc.useUtils()
    
    const mutation = trpc.personnel.create.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof NewPersonFormData, { message: error.shape.message })
            }
        }
    })

    const handleSubmit = form.handleSubmit(async (formData) => {
        const newPerson = await mutation.mutateAsync(formData)
        utils.personnel.invalidate()
        toast({
            title: "Person created",
            description: `${newPerson.name} has been created successfully.`,
        })
        
        router.push(Paths.system.personnel.person(newPerson.id).index)
    })

    return <AppPage>
        <AppPageBreadcrumbs 
            label="New Person"
            breadcrumbs={[
                { label: "System", href: Paths.system.index }, 
                { label: "Personnel", href: Paths.system.personnel.index }
            ]}
        />
        <AppPageContent variant="container">
            <FormProvider {...form}>
                <Card>
                    <CardHeader>
                        <CardTitle>New Person</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className=" space-y-4 p-2">
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
                                <FormCancelButton/>
                            </FormActions>
                        </form>
                    </CardContent>
                </Card>
            </FormProvider>
        </AppPageContent>
    </AppPage>
    
    
}