/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/personnel/[person_id]/team-memberships/--create
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PersonValue } from '@/components/controls/person-value'
import { TeamPicker } from '@/components/controls/team-picker'
import { CreateFormProps, Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { TeamMembershipWithPerson, useTRPC } from '@/trpc/client'



export default function AddTeamMembershipSheet(props: { params: Promise<{ person_id: string }> }) {
    const { person_id: personId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={() => router.back()}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Add Team Membership</SheetTitle>
                <SheetDescription>Add team membership for this person.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <CreateTeamMembershipByPersonForm
                    personId={personId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>
}


export function CreateTeamMembershipByPersonForm({ personId, onClose, onCreate }: CreateFormProps<TeamMembershipWithPerson> & { personId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId }))

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: {
            personId,
            teamId: '',
            tags: [],
            status: 'Active',
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        onError(error) {
            toast({
                title: "Error adding team membership",
                description: error.message,
                variant: 'destructive',
            })
        },
        async onSuccess(result) {
            toast({
                title: "Team membership added",
                description: <><ObjectName>{result.person.name}</ObjectName> is now a member of the team<ObjectName>{result.team.name}</ObjectName>.</>,
            })
            handleClose()
            onCreate?.(result)

            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        }
    }))

    const currentTeams = memberships.map(m => m.team.id)

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <PersonValue personId={personId}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                        <TeamPicker {...field} onValueChange={field.onChange} exclude={currentTeams}/>
                    </FormControl>
                    <FormMessage/>
                </FormItem>}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.add}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </Form>
    </FormProvider> 
}