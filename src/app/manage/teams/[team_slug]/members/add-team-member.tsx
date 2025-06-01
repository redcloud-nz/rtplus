/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match, P } from 'ts-pattern'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Alert } from '@/components/ui/alert'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { addTeamMemberFormSchema, AddTeamMemberFormSchema } from '@/lib/forms/add-team-member'
import { useTRPC } from '@/trpc/client'



export function AddTeamMemberDialog({ trigger }: { trigger: React.ReactNode }) {
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


function AddTeamMemberForm({ email, onClose }: { email: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: existing } = useSuspenseQuery(trpc.currentTeam.validateEmail.queryOptions({ email }))

    const form = useForm<AddTeamMemberFormSchema>({
        resolver: zodResolver(addTeamMemberFormSchema),
        defaultValues: {
            name: existing.person?.name ?? '',
            email,
            role: existing.teamMembership?.role ?? 'None',
            existingPersonId: existing.person?.id ?? undefined,
        }
    })

    const mutation = useMutation(trpc.currentTeam.addMember.mutationOptions({
        onError(error) {
            toast({
                title: "Error adding team membership",
                description: error.message,
                variant: 'destructive',
            })
            handleClose()
        },
        async onSuccess(newMembership) {
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the the .`,
            })
            await queryClient.invalidateQueries(trpc.currentTeam.members.queryFilter())
            handleClose()
        }
    }))

    function handleClose() {
        onClose()
        form.reset()
    }

    return <FormProvider {...form}>
        <form className="max-w-xl space-y-4">
            
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
                    <FixedFormValue value={email}/>
                </FormControl>
            </FormItem>

            {match(existing.person)
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
                            <FixedFormValue value={person.name} />
                        </FormControl>
                    </FormItem>
                )
                .exhaustive()
            }

            {match(existing.teamMembership)
                .with(null, () =>
                    // If the existing person is not a member of the team, allow their role to be selected.
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="Member">Member</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>The role of the team member.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )
                .with(P.not(null), (teamMembership) =>
                    // If the existing person is a member of the team, show their role as a fixed value.
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                        <FixedFormValue value={teamMembership.role} />
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