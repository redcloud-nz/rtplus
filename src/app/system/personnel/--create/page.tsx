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

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormActions, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormProvider, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { personFormSchema } from '@/lib/forms/person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


const newPersonFormSchema = personFormSchema.omit({ personId: true })
type NewPersonFormData = z.infer<typeof newPersonFormSchema>


export default function NewPersonPage() {

    const form = useForm<NewPersonFormData>({
        resolver: zodResolver(personFormSchema),
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
        await utils.personnel.invalidate()
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
            <PageHeader>
                <PageTitle>New Person</PageTitle>
            </PageHeader>
            <FormProvider {...form}>
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
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
                                <FormCancelButton href={Paths.system.personnel.index}/>
                            </FormActions>
                        </form>
                    </CardContent>
                </Card>
            </FormProvider>
        </AppPageContent>
    </AppPage>
    
    
}