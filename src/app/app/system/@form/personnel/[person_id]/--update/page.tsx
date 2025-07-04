/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/personnel/[person_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { useToast } from '@/hooks/use-toast'
import { SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/person'
import { PersonBasic, useTRPC } from '@/trpc/client'


export default function UpdatePersonSheet(props: { params: Promise<{ person_id: string}> }) {
    const { person_id: personId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Person</SheetTitle>
                <SheetDescription>Update the details of the team.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <UpdatePersonForm
                    personId={personId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}

/**
 * Component that displays a form to edit a person.
 * @param personId The ID of the person to edit.
 * @param onClose The function to call when the form is closed.
 */
function UpdatePersonForm({ personId, onClose }: UpdateFormProps<PersonBasic> & { personId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))

    const form = useForm<SystemPersonFormData>({
        resolver: zodResolver(systemPersonFormSchema),
        defaultValues: {
            personId,
            name: person.name,
            email: person.email,
            status: person.status,
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }
    
    const mutation = useMutation(trpc.personnel.sys_update.mutationOptions({
        async onMutate({ personId, ...update }) {
            await queryClient.cancelQueries(trpc.personnel.byId.queryFilter({ personId }))

            // Snapshot the previous value
            const previousPerson = queryClient.getQueryData(trpc.personnel.byId.queryKey({ personId }))

            // Optimistically update the cache
            if(previousPerson) {
                queryClient.setQueryData(trpc.personnel.byId.queryKey({ personId }), { ...previousPerson, ...update })
            }

            return { previousPerson }

        },
        onError(error, data, context) {
            // Rollback to previous data
            queryClient.setQueryData(trpc.personnel.byId.queryKey({ personId }), context?.previousPerson)

            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SystemPersonFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error updating person',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        onSuccess(updatedPerson) {
            toast({
                title: 'Person updated',
                description: `${updatedPerson.name} has been updated.`,
            })
            handleClose()
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.personnel.byId.queryFilter({ personId }))
            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
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
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-1/2">
                                <SelectValue placeholder="Select status..."/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormDescription>The status of the person.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </Form>
    </FormProvider> 
    
    
}