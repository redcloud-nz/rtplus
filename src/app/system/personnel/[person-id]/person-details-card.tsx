/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Person } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Card, CardActionButton, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { useToast } from '@/hooks/use-toast'
import { PersonFormData, personFormSchema } from '@/lib/forms/person'
import { useTRPC } from '@/trpc/client'


type PersonDetails = Pick<Person, 'id' | 'name' | 'email' | 'status'>

interface PersonDetailsCardProps {
    personId: string
}

export function PersonDetailsCard({ personId }: PersonDetailsCardProps) {
    const trpc = useTRPC()

    const personQuery = useQuery(trpc.personnel.byId.queryOptions({ personId }))
    const [mode, setMode] = React.useState<'View' | 'Edit'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <Show when={personQuery.isSuccess && mode == 'View'}>
                <CardActionButton
                    icon={<PencilIcon/>}
                    label="Edit"
                    onClick={() => setMode('Edit')}
                />
            </Show>
        </CardHeader>
        <CardContent>
            <Show 
                when={personQuery.isSuccess}
                fallback={<div className="space-y-4">
                    <Skeleton className="h-10"/>
                    <Skeleton className="h-10"/>
                    <Skeleton className="h-10"/>
                    <Skeleton className="h-10"/>
                </div>}
            >
                {personQuery.data && (mode == 'View'
                    ? <DisplayPersonDetails person={personQuery.data}/>
                    : <EditPersonForm person={personQuery.data} onClose={() => setMode('View')}/>
                )}   
            </Show>
        
        </CardContent>
    </Card>

}

function DisplayPersonDetails({ person }: { person: PersonDetails}) {
    return <DL>
        <DLTerm>RT+ ID</DLTerm>
        <DLDetails>{person.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{person.name}</DLDetails>
        
        <DLTerm>Email</DLTerm>
        <DLDetails>{person.email}</DLDetails>

        <DLTerm>Status</DLTerm>
        <DLDetails>{person.status}</DLDetails>
    </DL>
}


interface EditPersonFormProps {
    person: PersonDetails
    onClose: () => void
}

function EditPersonForm({ person, onClose }: EditPersonFormProps) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const form = useForm<PersonFormData>({
        resolver: zodResolver(personFormSchema),
        defaultValues: {
            ...person
        }
    })

    const { toast } = useToast()
    
    const mutation = useMutation(trpc.personnel.create.mutationOptions({
        onError: (error) => {
            console.error('Error updating person:', error)
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof PersonFormData, { message: error.shape.message })
            }
        }
    }))

    const handleSubmit = form.handleSubmit(async (formData) => {
        console.log('Form data:', formData)
        const updatedPerson = await mutation.mutateAsync(formData)
        queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
        toast({
            title: "Person updated",
            description: `${updatedPerson.name} has been updated successfully.`,
        })

        onClose()
    })

    return <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <SelectTrigger>
                                <SelectValue placeholder="Select status..."/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Deleted">Deleted</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormDescription>The status of the person.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormActions>
                <FormSubmitButton
                    labels={{
                        ready: 'Update',
                        submitting: 'Updating...',
                        submitted: 'Updated'
                    }}
                />
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider> 
    
    
}