/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { Spinner } from '@/components/ui/spinner'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonRef } from '@/lib/schemas/person'
import { TeamRef } from '@/lib/schemas/team'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




type TeamMembershipFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    scope: 'Person' | 'Team'
    organization: OrganizationData
    membership: TeamMembershipData
    person: PersonRef
    team: TeamRef
}

export function TeamMembershipForm({ scope, membership, organization, person, team, ...props }: TeamMembershipFormProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()


    const form = useForm({
        resolver: zodResolver(teamMembershipSchema),
        defaultValues: { ...membership }
    })

    const mutation = useMutation(trpc.teamMemberships.updateTeamMembership.mutationOptions({
        onError(error) {
            toast({
                title: 'Error updating team membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: "Team membership updated",
                description: <>The membership of <ObjectName>{person.name}</ObjectName> in <ObjectName>{team.name}</ObjectName> has been updated.</>,
            })

            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, personId: person.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, teamId: team.teamId }))
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMembership.queryFilter({ orgId: organization.orgId, personId: person.personId, teamId: team.teamId }))

            if(scope == 'Person') {
                router.push(Paths.org(organization.slug).admin.person(person.personId).teamMembership(team.teamId).href)
            } else {
                router.push(Paths.org(organization.slug).admin.team(team.teamId).member(person.personId).href)
            }
        }
    }))


    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Edit Team Membership</S2_CardTitle>
            <S2_CardDescription><span className="font-medium">{person.name}</span> in <span className="font-medium">{team.name}</span>.</S2_CardDescription>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="update-team-membership" onSubmit={form.handleSubmit(async (data) => mutation.mutateAsync({ ...data, orgId: organization.orgId }))} {...props}>
                <FieldGroup>
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                            >
                                <FieldContent>
                                    <FieldLabel htmlFor="team-membership-status">Status</FieldLabel>
                                    <FieldDescription>The current membership status.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="team-membership-status" className="min-w-1/2">
                                        <S2_SelectValue placeholder="Select status"/>
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
                            disabled={!form.formState.isDirty || mutation.isPending}
                            form="update-team-membership"
                        >
                            {mutation.isPending ? <><Spinner/> Updating...</> : 'Update' }
                        </S2_Button>
                        <S2_Button 
                            type="button"
                            variant="outline" 
                            disabled={mutation.isPending} onClick={() => { form.reset(); }} 
                            asChild
                        >
                            <Link 
                                to={scope == 'Person' 
                                    ? Paths.org(organization.slug).admin.person(person.personId).teamMembership(team.teamId) 
                                    : Paths.org(organization.slug).admin.team(team.teamId).member(person.personId)
                                }
                            >Cancel</Link>
                        </S2_Button>
                    </Field>
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}