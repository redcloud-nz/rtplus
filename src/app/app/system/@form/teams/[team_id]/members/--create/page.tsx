/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/teams/[team_id]/members/--create
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PersonPicker } from '@/components/controls/person-picker'
import { TeamValue } from '@/components/controls/team-value'
import { CreateFormProps, Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { TeamMembershipWithPerson, useTRPC } from '@/trpc/client'



export default function AddTeamMemberSheet(props: { params: Promise<{ team_id: string }> }) {
    const { team_id: teamId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={() => router.back()}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Add Team Member</SheetTitle>
                <SheetDescription>Add a member to this team.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <CreateTeamMembershipByTeamForm
                    teamId={teamId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}


export function CreateTeamMembershipByTeamForm({ teamId, onClose, onCreate }: CreateFormProps<TeamMembershipWithPerson> & { teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: {
            teamId,
            personId: '',
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

    const currentMembers = memberships.map(m => m.person.id)
    
    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <TeamValue teamId={teamId}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="personId"
                render={({ field }) => <FormItem>
                    <FormLabel>Person</FormLabel>
                    <FormControl>
                        <PersonPicker {...field} onValueChange={field.onChange} exclude={currentMembers}/>
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