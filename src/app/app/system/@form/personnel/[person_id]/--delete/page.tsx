/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/personnel/[person_id]/--delete
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PersonValue } from '@/components/controls/person-value'
import { Form, FormControl, FormActions, FormItem, FormLabel, FormSubmitButton, FormCancelButton, SubmitVerbs, DeleteFormProps } from '@/components/ui/form'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/person'
import * as Paths from '@/paths'
import { PersonBasic, useTRPC } from '@/trpc/client'



export default function DeletePersonSheet(props: { params: Promise<{ person_id: string }> }) {
    const { person_id: personId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Delete Person</SheetTitle>
                <SheetDescription>Permanently delete person?</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <DeletePersonForm
                    personId={personId}
                    onClose={() => router.back()}
                    onDelete={() => router.push(Paths.system.personnel.index)}
                />
            </SheetBody>
        </SheetContent>
    </Sheet>
}


function DeletePersonForm({ personId, onClose, onDelete }: DeleteFormProps<PersonBasic> & { personId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<Pick<SystemPersonFormData, 'personId'>>({
        resolver: zodResolver(systemPersonFormSchema.pick({ personId: true})),
        defaultValues: { personId }
    })

    const mutation = useMutation(trpc.personnel.sys_delete.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.personnel.all.queryFilter())

            const previousAll = queryClient.getQueryData(trpc.personnel.all.queryKey())
            const previousById = queryClient.getQueryData(trpc.personnel.byId.queryKey({ personId }))

            queryClient.setQueryData(trpc.personnel.all.queryKey(), (oldData) => oldData?.filter(p => p.id !== personId))
            queryClient.setQueryData(trpc.personnel.byId.queryKey({ personId }), undefined)

            onClose()
            return { previousAll, previousById }
        },
        onError(error, data, context) {
            // Rollback the optimistic update
            queryClient.setQueryData(trpc.personnel.all.queryKey({}), context?.previousAll )
            queryClient.setQueryData(trpc.personnel.byId.queryKey({ personId }), context?.previousById)

            toast({
                variant: 'destructive',
                title: 'Error deleting person',
                description: error.message
            })
        },
        onSuccess(result) {
            toast({
                title: 'Person deleted',
                description: <>The person <ObjectName>{result.name}</ObjectName> has been deleted successfully.</>
            })
            onDelete?.(result)
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
            queryClient.invalidateQueries(trpc.personnel.byId.queryFilter({ personId }))
        }
        
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <PersonValue personId={personId}/>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}