/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useLayoutEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { PersonFormData, personFormSchema } from '@/lib/forms/person'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function NewPersonDetailsCard() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const personId = useMemo(() => nanoId8(), [])

    const form = useForm<PersonFormData>({
        resolver: zodResolver(personFormSchema),
        defaultValues: {
            personId: personId,
            name: '',
            email: '',
            status: 'Active'
        }
    })

    const mutation = useMutation(trpc.personnel.sys_create.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof PersonFormData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating person",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
       onSuccess(result) {
            toast({
                title: "Person created",
                description: <>The person <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
            router.push(Paths.system.person(personId).index)
        }
    }))

    useLayoutEffect(() => {
        form.setValue('personId', personId)
    }, [form, personId])

    return <Card>
        <CardHeader>
            <CardTitle>New Person</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                    <ToruGrid mode="form">
                        <FormField
                            control={form.control}
                            name="personId"
                            render={({ field }) => <ToruGridRow
                                label="Person ID"
                                control={ <DisplayValue>{field.value}</DisplayValue>}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => <ToruGridRow
                                label="Name"
                                control={<Input maxLength={100} {...field}/>}
                                description="The full name of the person."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => <ToruGridRow
                                label="Email"
                                control={<Input type="email" maxLength={100} {...field}/>}
                                description="The email address of the person (must be unique)."
                            />}
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>Active</DisplayValue>}
                        />
                        <ToruGridFooter>
                            <FormSubmitButton labels={SubmitVerbs.create} size="sm"/>
                            <FormCancelButton onClick={() => router.back()} size="sm"/>
                        </ToruGridFooter>
                    </ToruGrid>
                </Form>
            </FormProvider>
            </CardContent>
    </Card>
}