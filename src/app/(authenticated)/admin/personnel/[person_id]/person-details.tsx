/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { PersonData, personSchema } from '@/lib/schemas/person'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




/**
 * Card that displays the details of a person and allows the user to edit them.
 * @param personId The ID of the person to display.
 */
export function PersonDetails_Card({ personId }: { personId: string }) {
    

    const { data: person } = useSuspenseQuery(trpc.personnel.getPerson.queryOptions({ personId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setMode('Update')} disabled={mode == 'Update'}>
                            <PencilIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit person details</TooltipContent>
                </Tooltip>
                 <DeletePersonDialog person={person}/>
                <Separator orientation="vertical"/>
                <CardExplanation>
                    This card displays the details of the person and allows you to edit them. You can also delete the person from here.
                </CardExplanation>
            </CardActions>
          
        </CardHeader>
        <CardContent>
             {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Person ID"
                            control={<DisplayValue>{person.personId}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{person.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Email"
                            control={<DisplayValue>{person.email}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>{person.status}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                
                )
                .with('Update', () => 
                    <UpdatePersonForm 
                        person={person}
                        onClose={() => setMode('View')}
                    />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
}   

function UpdatePersonForm({ onClose, person }: { onClose: () => void, person: PersonData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    

    const form = useForm<PersonData>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            ...person
        }
    })

    const mutation = useMutation(trpc.personnel.updatePerson.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof PersonData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error updating team",
                    description: error.message,
                    variant: 'destructive',
                })
                onClose()
            }
        },
        onSuccess(result) {
            toast({
                title: 'Person updated',
                description: <>The person <ObjectName>{result.name}</ObjectName> has been updated.</>,
            })
            onClose()

            queryClient.invalidateQueries(trpc.personnel.getPerson.queryFilter({ personId: result.personId }))
            queryClient.invalidateQueries(trpc.personnel.getPersonnel.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData }))}>
            <ToruGrid mode="form">
                <FormField
                    control={form.control}
                    name="personId"
                    render={({ field }) => <ToruGridRow
                        label="Person ID"
                        control={ <DisplayValue>{field.value}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => <ToruGridRow
                        label="Name"
                        control={<Input maxLength={100} {...field}/>}
                        description="The full name of the person."
                    />}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => <ToruGridRow
                        label="Email"
                        control={<Input type="email" maxLength={100} {...field}/>}
                        description="The email address of the person (must be unique)."
                    />}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => <ToruGridRow
                        label="Status"
                        control={
                            <Select {...field} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        description="The current status of the person."
                    />}
                />
                <ToruGridFooter>
                    <FormSubmitButton labels={SubmitVerbs.update} size="sm"/>
                    <FormCancelButton onClick={onClose} size="sm"/>
                </ToruGridFooter>
            </ToruGrid>
        </Form>
    </FormProvider>
}

function DeletePersonDialog({ person }: { person: PersonData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            personId: zodNanoId8,
            personName: z.literal(person.name)
        })),
        defaultValues: { personId: person.personId, personName: "" }
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
            setOpen(false)
            router.push(Paths.admin.personnel.href)

            queryClient.invalidateQueries(trpc.personnel.getPersonnel.queryFilter())
            queryClient.setQueryData(trpc.personnel.getPerson.queryKey({ personId: person.personId }), undefined)
        }
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete person" >
            <TrashIcon/>
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Person</DialogTitle>
                <DialogDescription>This will remove the person from RT+ forever (which is a really long time).</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData }))}>
                        <FormItem>
                            <FormLabel>Person</FormLabel>
                            <FormControl>
                                <DisplayValue>{person.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="personName"
                            render={({ field }) => <FormItem>
                                <FormLabel>Confirm Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Type the person's name to confirm" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormActions>
                            <FormSubmitButton labels={SubmitVerbs.delete} color="destructive"/>
                            <FormCancelButton onClick={() => setOpen(false)}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>
}