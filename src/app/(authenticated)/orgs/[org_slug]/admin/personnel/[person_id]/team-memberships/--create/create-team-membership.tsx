/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/--create
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
import { PersonId } from '@/lib/schemas/person'
import { teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export default function AdminModule_Person_CreateTeamMembership_Form({ organization, personId }: { organization: OrganizationData, personId: PersonId }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    
    const [
        { data: person },
        { data: teams }
    ] = useSuspenseQueries({
        queries: [
            trpc.personnel.getPerson.queryOptions({ orgId: organization.orgId, personId }),
            trpc.teams.getTeams.queryOptions({ orgId: organization.orgId }),
            trpc.teamMemberships.getTeamMemberships.queryOptions({ orgId: organization.orgId, personId })
        ]
    })

    const form = useForm({
        resolver: zodResolver(teamMembershipSchema),
        defaultValues: {
            teamId: '',
            personId,
            properties: {},
            tags: [],
            status: 'Active'
        }
    })

    const mutation = useMutation(trpc.teamMemberships.createTeamMembership.mutationOptions({
        async onMutate(data) {
            const newTeamMembership = { ...teamMembershipSchema.parse(data), person, team: teams.find(t => t.teamId === data.teamId)! }

            await queryClient.cancelQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, personId }))

            const previousTeamMemberships = queryClient.getQueryData(trpc.teamMemberships.getTeamMemberships.queryKey({ orgId: organization.orgId, personId }))

            queryClient.setQueryData(trpc.teamMemberships.getTeamMemberships.queryKey({ orgId: organization.orgId, personId }), (prev = []) => [...prev, newTeamMembership])

            router.push(Paths.org(organization.slug).admin.person(personId).href)

            return { previousTeamMemberships }
        },
        onError(error, _variables, _context) {
            if(_context?.previousTeamMemberships) {
                queryClient.setQueryData(trpc.teamMemberships.getTeamMemberships.queryKey({ orgId: organization.orgId, personId }), _context.previousTeamMemberships)
            }

            toast({
                title: 'Error creating team membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            toast({
                title: 'Team membership created',
                description: <><ObjectName>{result.person.name}</ObjectName> has been addded to the team <ObjectName>{result.team.name}</ObjectName>.</>
            })

            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, teamId: result.teamId }))
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, personId }))
            
        }
    }))
    

    return <form id="create-team-membership-form" onSubmit={form.handleSubmit(async (data) => mutation.mutate({ ...data, orgId: organization.orgId }))}>
        <FieldGroup>
            <Controller
                name="teamId"
                control={form.control}
                render={({ field, fieldState }) => 
                    <Field orientation="responsive" data-invalid={fieldState.invalid}>
                        <FieldContent>
                            <FieldLabel htmlFor="team-membership-team-id">Team</FieldLabel>
                            { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                        </FieldContent>
                        <S2_Select value={field.value} onValueChange={field.onChange}>
                            <S2_SelectTrigger id="team-membership-team-id" className="min-w-1/2" aria-invalid={fieldState.invalid} autoFocus>
                                <S2_SelectValue placeholder="Select a team" />
                            </S2_SelectTrigger>
                            <S2_SelectContent>
                                {teams.map(team => 
                                    <S2_SelectItem key={team.teamId} value={team.teamId}>{team.name}</S2_SelectItem>
                                )}
                            </S2_SelectContent>
                        </S2_Select>
                    </Field>
                }
            />

            <Field orientation="horizontal">
                <S2_Button 
                    type="submit"
                    disabled={mutation.isPending}
                    form="create-team-membership-form"
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
                    <Link to={Paths.org(organization.slug).admin.person(personId)}>
                        Cancel
                    </Link>
                </S2_Button>
            </Field>
        </FieldGroup>
    </form>
}