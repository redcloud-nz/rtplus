/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match, P } from 'ts-pattern'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Alert } from '@/components/ui/alert'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { nanoId8 } from '@/lib/id'
import { TeamData } from '@/lib/schemas/team'
import { useTRPC } from '@/trpc/client'




export function AddTeamMemberDialog({ team, trigger }: { team: TeamData, trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                
            </DialogHeader>
            <DialogBody>
                { open 
                    ? email
                        ? <AddTeamMemberForm 
                            email={email} 
                            onClose={() => setOpen(false)}
                            teamId={team.teamId}
                        />
                        : <SpecifyEmailForm 
                            onSubmit={(email) => {
                                setEmail(email)
                                setOpen(true)
                            }} 
                            onClose={() => setOpen(false)}
                          />
                    : null }
            </DialogBody>
        </DialogContent>
    </Dialog>
}


const specifyEmailFormSchema = z.object({ email: z.string().email('Invalid email address') })
type SpecifyEmailFormData = z.infer<typeof specifyEmailFormSchema>

/**
 * Simple form that collects an email address for to decide whether to add a new person or an existing one.
 */
function SpecifyEmailForm({ onSubmit, onClose }: { onSubmit: (email: string) => void, onClose: () => void }) {
    
    const form = useForm<SpecifyEmailFormData>({
        resolver: zodResolver(specifyEmailFormSchema),
        defaultValues: { email: '' }
    })

    function handleSubmit(formData: SpecifyEmailFormData) {
        onSubmit(formData.email.trim().toLowerCase())
    }

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xl space-y-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input {...field}/>
                        </FormControl>
                        <FormDescription>
                            The email address of the person you want to add to the team.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormActions>
                <FormSubmitButton labels={{
                    ready: 'Continue',
                    submitting: 'Checking...',
                    submitted: 'Checked'
                }}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}


const addTeamMemberFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    tags: z.array(z.string()),
})
type AddTeamMemberFormData = z.infer<typeof addTeamMemberFormSchema>

function AddTeamMemberForm({ email, onClose, teamId }: { email: string, onClose: () => void, teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: existingPerson } = useSuspenseQuery(trpc.personnel.byEmail.queryOptions({ email }))
    const { data: existingTeamMemberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))
    const existingTeamMembership = existingTeamMemberships.find(m => m.personId === existingPerson?.personId) ?? null

    const personId = useMemo(() => existingPerson?.personId ?? nanoId8(), [existingPerson])

    const form = useForm<AddTeamMemberFormData>({
        resolver: zodResolver(addTeamMemberFormSchema),
        defaultValues: {
            name: existingPerson?.name ?? '',
            tags: [],
        }
    })

    const createPersonMutation = useMutation(trpc.personnel.create.mutationOptions())
    const createTeamMembershipMutation = useMutation(trpc.teamMemberships.create.mutationOptions())

    const handleSubmit = form.handleSubmit(async (formData) => {

        try {
            const person = existingPerson ?? await createPersonMutation.mutateAsync({ personId, name: formData.name, email, owningTeamId: teamId, status: 'Active' })

            await createTeamMembershipMutation.mutateAsync({ teamId, personId, tags: formData.tags, status: 'Active' })

            await queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: person.personId }))

            toast({
                title: "Team membership added",
                description: <>The person <ObjectName>{person.name}</ObjectName> has been successfully added to the team.</>,
            })

        } catch (error) {
            toast({
                title: "Error adding team membership",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                variant: 'destructive',
            })
        }
        handleClose()

    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const existing = { person: existingPerson, teamMembership: existingTeamMembership }

    return <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
            
            {match(existing)
                .with( { person: null }, () => null)
                .with( { person: P.not(null), teamMembership: null }, () => 
                    <Alert title="Existing Person">A person with that email address already exists. You can add them to the team below.</Alert>
                )
                .with( { person: P.not(null), teamMembership: P.not(null) }, () =>
                    <Alert severity="warning" title="Already Assigned">A person with that email address is already a member of the team.</Alert>
                )
                .exhaustive()
            }

            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <DisplayValue>{email}</DisplayValue>
                </FormControl>
            </FormItem>

            {match(existingPerson)
                .with(null, () =>
                    // If the person does not exist, allow entering their name.
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field}/>
                                </FormControl>
                                <FormDescription>The full name of the person.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )
                .with(P.not(null), (person) =>
                    // If the person exists, show their name as a fixed value.
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <DisplayValue>{person.name}</DisplayValue>
                        </FormControl>
                    </FormItem>
                )
                .exhaustive()
            }

           
            <FormActions>
                {match(existing)
                    .with( { person: null }, () =>
                        // If the person does not exist, allow creating a new person.
                        <FormSubmitButton labels={SubmitVerbs.create}/>
                    )
                    .with( { person: P.not(null), teamMembership: null }, () => 
                        // If the person exists but is not a member of the team, allow adding them.
                        <FormSubmitButton labels={SubmitVerbs.add}/>
                    )
                    .with( { person: P.not(null), teamMembership: P.not(null) }, () =>
                        // If the person exists, do not allow adding them again.
                        // This is handled by the alert above, so we do not show a button.
                        <></>
                    )
                    .exhaustive()
                }
                
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>

    
}