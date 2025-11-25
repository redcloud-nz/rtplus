/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { pick } from 'remeda'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonData, personSchema} from '@/lib/schemas/person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



type PersonFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    mode: 'Create' | 'Update'
    organization: OrganizationData
    person: PersonData
}

export function PersonForm({ mode, organization, person, ...props }: PersonFormProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm({
        resolver: zodResolver(personSchema.pick({ name: true, email: true, status: true })),
        defaultValues: pick(person, ['name', 'email', 'status'])
    })

    const handleSubmit = form.handleSubmit(async (formData) => {
        if(mode === 'Create') {
            await createMutation.mutateAsync({ ...person, ...formData, orgId: organization.orgId })
        } else {
            await updateMutation.mutateAsync({ ...person, ...formData, orgId: organization.orgId })
        }
    })

    const createMutation = useMutation(trpc.personnel.createPerson.mutationOptions({
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
                form.setError(error.shape.cause.message as keyof Pick<PersonData, 'name' | 'email' | 'status'>, { message: error.shape.message })
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

            queryClient.invalidateQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))

            router.push(Paths.org(organization.slug).admin.person(person.personId).href)
        }
    }))

    const updateMutation = useMutation(trpc.personnel.updatePerson.mutationOptions({
        async onMutate(data) {
            const updatedPerson = personSchema.parse(data)

            await queryClient.cancelQueries(trpc.personnel.getPersonnel.queryFilter({ orgId: organization.orgId }))
            await queryClient.cancelQueries(trpc.personnel.getPerson.queryFilter({ orgId: organization.orgId, personId: person.personId }))

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
                form.setError(error.shape.cause.message as keyof Pick<PersonData, 'name' | 'email' | 'status'>, { message: error.shape.message })
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

    const isPending = createMutation.isPending || updateMutation.isPending
    
    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>{mode == 'Create' ? 'Create Person' : 'Update Person'}</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="person-form" onSubmit={handleSubmit} {...props}>
                <FieldGroup>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field data-invalid={fieldState.invalid}>
                                <FieldContent>
                                    <FieldLabel htmlFor="person-name">Name</FieldLabel>
                                    <FieldDescription>The full name of the person.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="person-name"
                                    maxLength={100}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Field>
                        }
                    />
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field data-invalid={fieldState.invalid}>
                                <FieldContent>
                                    <FieldLabel htmlFor="person-email">Email</FieldLabel>
                                    <FieldDescription>The unique email address of the person.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="person-email"
                                    type="email"
                                    maxLength={100}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Field>
                        }
                    />
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                                >
                                <FieldContent>
                                    <FieldLabel htmlFor="person-status">Status</FieldLabel>
                                    <FieldDescription>The current record status.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="person-status" className="min-w-32" aria-invalid={fieldState.invalid}>
                                        <S2_SelectValue placeholder="Select status" />
                                    </S2_SelectTrigger>
                                    <S2_SelectContent>
                                        <S2_SelectItem value="Active">Active</S2_SelectItem>
                                        <S2_SelectItem value="Inactive">Inactive</S2_SelectItem>
                                    </S2_SelectContent>
                                </S2_Select>
                            </Field>
                        }
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit"
                            disabled={!form.formState.isDirty || isPending}
                            form="person-form"
                        >
                            {mode === 'Create' ? 'Create' : 'Save'}
                        </S2_Button>
                        <S2_Button 
                            type="button"
                            variant="outline" 
                            disabled={isPending} onClick={() => form.reset() } 
                            asChild
                        >
                            <Link to={mode === 'Create' ? Paths.org(organization.slug).admin.personnel : Paths.org(organization.slug).admin.person(person.personId)}>
                                Cancel
                            </Link>
                        </S2_Button>
                    </Field>
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}