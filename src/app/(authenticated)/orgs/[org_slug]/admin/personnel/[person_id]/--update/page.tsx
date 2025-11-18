/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { PersonForm } from '@/components/forms/person-form'
import { ToParentPageIcon } from '@/components/icons'
import { Link } from '@/components/ui/link'
import { S2_Button } from '@/components/ui/s2-button'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { PersonData, personSchema } from '@/lib/schemas/person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export default function AdminModule_PersonUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/--update'>) {
    const { org_slug: orgSlug, person_id: personId } = use(props.params)
    
    const organization = useOrganization()

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

    return <Lexington.Column width="lg">
        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.person(personId)}>
                    <ToParentPageIcon/> {person.name}
                </Link>
            </S2_Button>
        </Lexington.ColumnControls>
        <PersonForm 
            mode="Update"
            form={form}
            organization={organization} 
            personId={person.personId}
            onSubmit={async (data) => {
                await mutation.mutateAsync({ ...data, orgId: organization.orgId })
            }}
        />
    </Lexington.Column>
}