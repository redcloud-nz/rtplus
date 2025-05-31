/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Card, CardActionButton, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/system-person'
import { useTRPC } from '@/trpc/client'




/**
 * Card that displays the details of a person and allows the user to edit them.
 * @param personId The ID of the person to display.
 */
export function PersonDetailsCard({ personId }: { personId: string }) {
    const [mode, setMode] = React.useState<'View' | 'Edit'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Person Details</CardTitle>
            <Show when={mode == 'View'}>
                <CardActionButton
                    icon={<PencilIcon/>}
                    label="Edit"
                    onClick={() => setMode('Edit')}
                />
            </Show>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>More options</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem disabled>
                            <TrashIcon/>
                            <span>Delete person</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            { mode == 'View'
                ? <PersonDetailsList personId={personId}/>
                : <EditPersonForm personId={personId} onClose={() => setMode('View')}/>
            }
        </CardBody>
    </Card>
}   


/**
 * Component that displays the details of a person.
 * @param personId The ID of the person to display.
 */
function PersonDetailsList({ personId }: { personId: string }) {

    const trpc = useTRPC()
    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))
    if(person == null) throw new Error(`Person(${personId}) not found`)

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


/**
 * Component that displays a form to edit a person.
 * @param personId The ID of the person to edit.
 * @param onClose The function to call when the form is closed.
 */
function EditPersonForm({ personId, onClose }: { personId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))

    const form = useForm<SystemPersonFormData>({
        resolver: zodResolver(systemPersonFormSchema),
        defaultValues: {
            personId: personId,
            name: person.name,
            email: person.email,
            status: person.status,
        }
    })

    const { toast } = useToast()
    
    const mutation = useMutation(trpc.personnel.update.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SystemPersonFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error updating person',
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(updatedPerson) {
            queryClient.invalidateQueries(trpc.personnel.all.queryFilter())
            queryClient.invalidateQueries(trpc.personnel.byId.queryFilter({ personId: updatedPerson.id }))
            toast({
                title: 'Person updated',
                description: `${updatedPerson.name} has been updated successfully.`,
            })
            onClose()
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="space-y-4 p-2">
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