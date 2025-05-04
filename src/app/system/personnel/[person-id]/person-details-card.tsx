/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { Person } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {  FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/trpc/client'
import { Show } from '@/components/show'
import { Skeleton } from '@/components/ui/skeleton'







type PersonDetails = Pick<Person, 'id' | 'name' | 'email' | 'status'>

export function PersonDetailsCard({ personId }: { personId: string }) {

    const personQuery = trpc.personnel.byId.useQuery({ personId })
    const [mode, setMode] = React.useState<'View' | 'Edit'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <Show when={personQuery.isSuccess && mode == 'View'}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setMode('Edit')}>
                            <PencilIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                </Tooltip>
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
                {mode == 'View'
                    ? <DisplayPersonDetails person={personQuery.data!!}/>
                    : <EditPersonForm person={personQuery.data!!} setMode={setMode}/>
                }   
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



const editPersonFormSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(5).max(100),
    email: z.string().email(),
    status: z.enum(['Active', 'Inactive', 'Deleted'])
})

export type EditPersonFormData = z.infer<typeof editPersonFormSchema>

function EditPersonForm({ person, setMode }: { person: PersonDetails, setMode: (newValue: 'View' | 'Edit') => void }) {
   

    const form = useForm<EditPersonFormData>({
        resolver: zodResolver(editPersonFormSchema),
        defaultValues: {
            ...person
        }
    })

    const { toast } = useToast()
    const utils = trpc.useUtils()
    
    const mutation = trpc.personnel.update.useMutation({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof EditPersonFormData, { message: error.shape.message })
            }
        }
    })

    const handleSubmit = form.handleSubmit(async (formData) => {
        const updatedPerson = await mutation.mutateAsync(formData)
        utils.personnel.invalidate()
        utils.personnel.byId.setData({ personId: updatedPerson.id }, updatedPerson)
        toast({
            title: "Person updated",
            description: `${updatedPerson.name} has been updated successfully.`,
        })
        setMode('View')
        
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
                <FormCancelButton onClick={() => setMode('View')}/>
            </FormActions>
        </form>
    </FormProvider> 
    
    
}