/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]/members/--create
 */
'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export default function AdminModule_Team_CreateTeamMembership_Form({ organization, teamId }: { organization: OrganizationData, teamId: string }) {

    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    
    const [
        { data: team },
        { data: personnel },
        { data: existingMemberships }
    ] = useSuspenseQueries({
        queries: [
            trpc.teams.getTeam.queryOptions({ orgId: organization.orgId, teamId }),
            trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }),
            trpc.teamMemberships.getTeamMemberships.queryOptions({ orgId: organization.orgId, teamId })
        ]
    })

    const form = useForm({
        resolver: zodResolver(teamMembershipSchema),
        defaultValues: {
            teamId,
            personId: '',
            properties: {},
            tags: [],
            status: 'Active'
        }
    })

    const mutation = useMutation(trpc.teamMemberships.createTeamMembership.mutationOptions({
        async onMutate(data) {
            const newMembership = { ...teamMembershipSchema.parse(data), person: personnel.find(p => p.personId === data.personId)!, team }

            await queryClient.cancelQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, teamId }))

            const previousTeamMemberships = queryClient.getQueryData(trpc.teamMemberships.getTeamMemberships.queryKey({ orgId: organization.orgId, teamId }))

            queryClient.setQueryData(trpc.teamMemberships.getTeamMemberships.queryKey({ orgId: organization.orgId, teamId }), (prev = []) => {
                return [...prev, newMembership]
            })

            router.push(Paths.org(organization.slug).admin.team(team.teamId).href)
            
            return { previousTeamMemberships }
        },
        onError(error, _data, context) {
            if(context?.previousTeamMemberships) {
                queryClient.setQueryData(trpc.teamMemberships.getTeamMemberships.queryKey({ orgId: organization.orgId, teamId }), context.previousTeamMemberships)
            }
            toast({
                title: 'Error adding team member',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            toast({
                title: 'Team member added',
                description: <><ObjectName>{result.person.name}</ObjectName> has been addded to the team <ObjectName>{result.team.name}</ObjectName>.</>
            })

            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, personId: result.personId }))
            form.reset()
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, teamId }))
        }
    })) 

    return <form id="create-team-member-form" onSubmit={form.handleSubmit(data => mutation.mutate({ ...data, orgId: organization.orgId }))}>
        <FieldGroup>
            <Controller
                name="personId"
                control={form.control}
                render={({ field, fieldState }) => 
                    <Field orientation="responsive" data-invalid={fieldState.invalid}>
                        <FieldContent>
                            <FieldLabel htmlFor="team-membership-person-id">Person</FieldLabel>
                            { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                        </FieldContent>
                        <S2_Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                        >
                            <S2_SelectTrigger id="team-membership-person-id" aria-invalid={fieldState.invalid} autoFocus>
                                <S2_SelectValue placeholder="Select a person"/>
                            </S2_SelectTrigger>
                            <S2_SelectContent>
                                {personnel.map(person => 
                                    <S2_SelectItem 
                                        key={person.personId} 
                                        value={person.personId}
                                        disabled={existingMemberships.some(m => m.personId === person.personId)}
                                    >{person.name}</S2_SelectItem>
                                )}
                            </S2_SelectContent>
                        </S2_Select>
                    </Field>
                }
            />
            <Field orientation="horizontal">
                <S2_Button 
                    type="submit"
                    disabled={!form.formState.isDirty || mutation.isPending}
                    form="create-team-member-form"
                >
                    Add Membership
                </S2_Button>
                <S2_Button 
                    type="button"
                    variant="outline" 
                    disabled={mutation.isPending} 
                    onClick={() => form.reset() } 
                    asChild
                >
                    <Link to={Paths.org(organization.slug).admin.team(team.teamId)}>
                        Cancel
                    </Link>
                </S2_Button>
            </Field>                  
        </FieldGroup>
    </form>
}