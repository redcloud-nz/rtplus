/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PersonForm } from '@/components/forms/person-form'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonData, PersonId, personSchema } from '@/lib/schemas/person'
import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'






export function AdminModule_PersonUpdate_Form({ organization, personId }: { organization: OrganizationData, personId: PersonId }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: person } = useSuspenseQuery(trpc.personnel.getPerson.queryOptions({ orgId: organization.orgId, personId }))

    const form = useForm<PersonData>({
        resolver: zodResolver(personSchema),
        defaultValues: { ...person }
    })

    const mutation = useMutation(trpc.personnel.updatePerson.mutationOptions({
        async onMutate(data) {
            const updatedPerson = personSchema.parse(data)

            await queryClient.cancelQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))

            const previousPersonnel = queryClient.getQueryData(trpc.personnel.getPersonnel.queryKey({ orgId: organization.orgId }))
            const previousPerson = queryClient.getQueryData(trpc.personnel.getPerson.queryKey({ orgId: organization.orgId, personId: person.personId }))

            queryClient.setQueryData(trpc.personnel.getPersonnel.queryKey({ orgId: organization.orgId }), (prev = []) => {
                return prev.map(p => p.personId === updatedPerson.personId ? updatedPerson : p)
            })
            queryClient.setQueryData(trpc.personnel.getPerson.queryKey({ orgId: organization.orgId, personId: person.personId }), updatedPerson)

            return { previousPersonnel, previousPerson }

        },
        onError(error, _variables, context) {
            if(context?.previousPersonnel) {
                queryClient.setQueryData(trpc.personnel.getPersonnel.queryKey({ orgId: organization.orgId }), context.previousPersonnel)
            }
            if(context?.previousPerson) {
                queryClient.setQueryData(trpc.personnel.getPerson.queryKey({ orgId: organization.orgId, personId: person.personId }), context.previousPerson)
            }

            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof PersonData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error updating person",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            
            toast({
                title: "Person updated",
                description: `The person ${result.name} has been updated successfully.`,
            })

            router.push(Paths.org(organization.slug).admin.person(person.personId).href)

            queryClient.invalidateQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))
            queryClient.invalidateQueries(trpc.personnel.getPerson.queryFilter({ orgId: organization.orgId, personId: person.personId }))
        }
    }))

    return <PersonForm 
        mode="Update"
        form={form}
        organization={organization} 
        personId={person.personId}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}  />
}