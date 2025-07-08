/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/personnel/--create
 */
'use client'

import { useRouter } from 'next/navigation'
import {  useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CreateFormProps, Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { useToast } from '@/hooks/use-toast'
import { SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/person'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { PersonBasic, useTRPC } from '@/trpc/client'


export default function CreatePersonSheet() {
    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>New Person</SheetTitle>
                <SheetDescription>Create a new person.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <CreatePersonForm
                    onClose={() => router.back()} 
                    onCreate={person => router.push(Paths.system.person(person.id).index)}
                />
            </SheetBody>
        </SheetContent>
    </Sheet>
}

function CreatePersonForm({ onClose, onCreate }: CreateFormProps<PersonBasic>) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const personId = useMemo(() => nanoId8(), [])

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
            onCreate?.(newPerson)
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
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
            
        </Form>
    </FormProvider>
}