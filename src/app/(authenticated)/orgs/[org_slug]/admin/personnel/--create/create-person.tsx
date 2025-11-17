/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PersonForm } from '@/components/forms/person-form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonData, PersonId, personSchema } from '@/lib/schemas/person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




export function AdminModule_CreatePerson_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    
    const personId = useMemo(() => PersonId.create(), [])

    const form = useForm<PersonData>({
            resolver: zodResolver(personSchema),
            defaultValues: {
                personId, 
                name: '', 
                email: '', 
                status: 'Active', 
                userId: null,  
                tags: [], 
                properties: {}
            }
        })

    const mutation = useMutation(trpc.personnel.createPerson.mutationOptions({
        async onMutate(data) {
            const newPerson = personSchema.parse(data)

            await queryClient.cancelQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))

            const previousPersonnel = queryClient.getQueryData(trpc.personnel.getPersonnel.queryKey({ orgId: organization.orgId }))

            queryClient.setQueryData(trpc.personnel.getPersonnel.queryKey({ orgId: organization.orgId }), (prev = []) => [...prev, newPerson])

            return { previousPersonnel }
        },
        onError(error, _variables, context) {
            if(context?.previousPersonnel) {
                queryClient.setQueryData(trpc.personnel.getPersonnel.queryKey({ orgId: organization.orgId }), context.previousPersonnel)
            }
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof PersonData, { message: error.shape.message })
            }

            toast({
                    title: "Error creating person",
                    description: error.message,
                    variant: 'destructive',
                })
        },
       onSuccess(result) {
            toast({
                title: "Person created",
                description: <>The person <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))

            router.push(Paths.org(organization.slug).admin.person(personId).href)
        }
    }))

    return <PersonForm
        mode="Create"
        form={form}
        organization={organization} 
        personId={personId} 
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}