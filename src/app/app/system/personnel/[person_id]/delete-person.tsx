/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/person'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'





export function DeletePersonDialog({ personId, ...props }: ComponentProps<typeof Dialog> & { personId: string}) {
   
    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Person</DialogTitle>
                <DialogDescription>
                    This action will permanently remove the person.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <DeletePersonForm personId={personId} onClose={() => props.onOpenChange?.(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function DeletePersonForm({ personId, onClose }: { personId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))

    const form = useForm<Pick<SystemPersonFormData, 'personId'>>({
        resolver: zodResolver(systemPersonFormSchema.pick({ personId: true})),
        defaultValues: { personId: person.id }
    })

    const mutation = useMutation(trpc.personnel.sys_delete.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.personnel.all.queryFilter())

            const previousPersonnel = queryClient.getQueryData(trpc.personnel.all.queryKey())

            queryClient.setQueryData(trpc.personnel.all.queryKey(), (oldData) => oldData?.filter(p => p.id !== personId))

            onClose()
            router.push(Paths.system.personnel.index)
            return { previousPersonnel }
        },
        onError(error, data, context) {
            // Rollback the optimistic update
            queryClient.setQueryData(trpc.personnel.all.queryKey({}), context?.previousPersonnel)

            toast({
                variant: 'destructive',
                title: 'Error deleting person',
                description: error.message
            })
        },
        onSuccess() {
            toast({
                title: 'Person deleted',
                description: <>Successfully removed <ObjectName>{person.name}</ObjectName>.</>
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
        }
        
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className='max-w-xl space-y-4'>
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <FixedFormValue value={person.name}/>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}