/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/s2-dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ObjectName } from '@/components/ui/typography'
import { S2_Value } from '@/components/ui/s2-value'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData, OrganizationId } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


/**
 * A dialog that prompts the user to confirm deletion of a person.
 */
export function AdminModule_DeletePerson_Dialog({ organization, personId, ...props }: Omit<ComponentProps<typeof Dialog>, 'children'> & { organization: OrganizationData, personId: PersonId }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: person } = useSuspenseQuery(trpc.personnel.getPerson.queryOptions({ orgId: organization.orgId, personId }))

    const form = useForm({
        resolver: zodResolver(z.object({
            orgId: OrganizationId.schema,
            personId: zodNanoId8,
            personName: z.literal(person.name)
        })),
        defaultValues: { orgId: organization.orgId, personId: person.personId, personName: "" }
    })

    const mutation = useMutation(trpc.personnel.deletePerson.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting person',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: 'Person deleted',
                description: <>The person <ObjectName>{person.name}</ObjectName> has been deleted.</>,
            })

            queryClient.invalidateQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))
            queryClient.removeQueries(trpc.personnel.getPerson.queryFilter({ orgId: organization.orgId, personId: person.personId }))

            props.onOpenChange?.(false)
            router.push(Paths.org(organization.slug).admin.personnel.href)
        }
    }))

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Person</DialogTitle>
                <DialogDescription>This will remove the person from RT+ forever (which is a really long time).</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData }))}>
                <FieldGroup>
                    <Field orientation="responsive">
                        <FieldLabel>Person</FieldLabel>
                        <S2_Value value={person.name} className="min-w-1/2"/>
                    </Field>
                    <Controller
                        name="personName"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field orientation="responsive" data-invalid={fieldState.invalid}>
                                <FieldContent>
                                    <FieldLabel htmlFor="delete-person-confirm-name">Confirm Person Name</FieldLabel>
                                    <FieldDescription>Type the person's name to confirm.</FieldDescription>
                                    { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <Input 
                                    {...field}
                                    id="delete-person-confirm-name"
                                    aria-invalid={fieldState.invalid}
                                    className="min-w-1/2"
                                />
                        
                        </Field>}
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit" 
                            variant="destructive"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? <><Spinner /> Deleting...</> : 'Delete' }
                        </S2_Button>
                        <DialogClose asChild>
                            <S2_Button variant="outline">Cancel</S2_Button>
                        </DialogClose>
                    </Field>
                </FieldGroup>
            </form>
        </DialogContent>
    </Dialog>
}