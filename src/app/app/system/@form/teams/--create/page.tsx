/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/teams/--create
 */
'use client'

import { useRouter } from 'next/navigation'
import {  useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CreateFormProps, Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { nanoId8 } from '@/lib/id'
import { TeamBasic, useTRPC } from '@/trpc/client'

import * as Paths from '@/paths'



export default function CreateTeamSheet() {
    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>New Team</SheetTitle>
                <SheetDescription>Create a new team in the system.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <CreateTeamForm
                    onClose={() => router.back()} 
                    onCreate={team => router.push(Paths.system.team(team.id).index)}
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}

export function CreateTeamForm({ onClose, onCreate }: CreateFormProps<TeamBasic>) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const teamId = useMemo(() => nanoId8(), [])

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            teamId: teamId,
            name: '',
            shortName: '',
            slug: teamId,
            color: '',
            status: 'Active'
        }
    })

   function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.teams.sys_create.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error creating team',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        async onSuccess(result) {
            toast({
                title: 'Team created',
                description: <>The team <ObjectName>{result.name}</ObjectName> has been create successfully.</>,
            })
            handleClose()
            onCreate?.(result)

            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input maxLength={100} {...field}/>
                    </FormControl>
                    <FormDescription>The full name of the team.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => <FormItem>
                    <FormLabel>Short name</FormLabel>
                    <FormControl>
                        <Input maxLength={20} {...field}/>
                    </FormControl>
                    <FormDescription>Short name of the team (eg NZ-RT13).</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="slug"
                render={({ field }) => <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                        <SlugInput {...field} onChange={(ev, newValue) => field.onChange(newValue)}/>
                    </FormControl>
                    <FormDescription>URL-friendly identifier for the team.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            {/* <FormField
                control={form.control}
                name="color"
                render={({ field }) => <FormItem>
                    <FormLabel>Colour</FormLabel>
                    <FormControl>
                        <Input className="max-w-xs" maxLength={7} {...field}/>
                    </FormControl>
                    <FormDescription>Highlight colour applied to help differentiate from other teams (optional).</FormDescription>
                    <FormMessage/>
                </FormItem>}
            /> */}
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}