/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { pick } from 'remeda'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { S2_Value } from '@/components/ui/s2-value'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { isIntegrationEnabled } from '@/lib/integrations'
import { OrganizationData } from '@/lib/schemas/organization'
import { TeamData, teamSchema } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


type TeamFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    mode: 'Create' | 'Update'
    organization: OrganizationData
    team: TeamData

}

export function TeamForm({ mode, organization, team, ...props }: TeamFormProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm({
        resolver: zodResolver(teamSchema.pick({ name: true, status: true, properties: true})),
        defaultValues: pick(team, ['name', 'status', 'properties'])
    })

    const handleSubmit = form.handleSubmit(async (data) => {
        if(mode == 'Create') {
            await createMutation.mutateAsync({ ...team, ...data, orgId: organization.orgId })
        } else {
            await updateMutation.mutateAsync({ ...team, ...data, orgId: organization.orgId })
        }
    })

    const createMutation = useMutation(trpc.teams.createTeam.mutationOptions({
        async onMutate(data) {
            const newTeam = teamSchema.parse(data)

            await queryClient.cancelQueries(trpc.teams.getTeams.queryFilter({ orgId: organization.orgId }))

            const previousTeams = queryClient.getQueryData(trpc.teams.getTeams.queryKey({ orgId: organization.orgId }))

            queryClient.setQueryData(trpc.teams.getTeams.queryKey({ orgId: organization.orgId }), (prev = []) => [...prev, { ...newTeam, _count: { teamMemberships: 0 } }])

            return { previousTeams }
        },
        onError(error, _variables, context) {
            if(context?.previousTeams) {
                queryClient.setQueryData(trpc.teams.getTeams.queryKey({ orgId: organization.orgId }), context.previousTeams)
            }

            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof Pick<TeamData, 'name' | 'status'>, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating team",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Team created",
                description: <>The team <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.teams.getTeams.queryFilter())
            router.push(Paths.org(organization.slug).admin.team(result.teamId).href)
        }
    }))

    const updateMutation = useMutation(trpc.teams.updateTeam.mutationOptions({
        async onMutate(data) {
            const updatedTeam = teamSchema.parse(data)

            await queryClient.cancelQueries(trpc.teams.getTeams.queryFilter({ orgId: organization.orgId }))

            const previousTeams = queryClient.getQueryData(trpc.teams.getTeams.queryKey({ orgId: organization.orgId }))
            const previousTeam = queryClient.getQueryData(trpc.teams.getTeam.queryKey({ orgId: organization.orgId, teamId: team.teamId }))

            queryClient.setQueryData(trpc.teams.getTeams.queryKey({ orgId: organization.orgId }), (prev = []) => {
                return prev.map(t => t.teamId === updatedTeam.teamId ? { ...t, ...updatedTeam} : t)
            })
            queryClient.setQueryData(trpc.teams.getTeam.queryKey({ orgId: organization.orgId, teamId: team.teamId }), updatedTeam)
            
            return { previousTeams, previousTeam }

        },
        onError(error, _variables, context) {
            if(context?.previousTeams) {
                queryClient.setQueryData(trpc.teams.getTeams.queryKey({ orgId: organization.orgId }), context.previousTeams)
            }
            if(context?.previousTeam) {
                queryClient.setQueryData(trpc.teams.getTeam.queryKey({ orgId: organization.orgId, teamId: team.teamId }), context.previousTeam)
            }

            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof Pick<TeamData, 'name' | 'status'>, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error updating team',
                    description: error.message,
                    variant: 'destructive'
                })
            }
        },
        onSuccess(result) {
            toast({
                title: 'Team updated',
                description: <>The team <ObjectName>{result.name}</ObjectName> has been updated.</>,
            })
            
            router.push(Paths.org(organization.slug).admin.team(result.teamId).href)

            queryClient.invalidateQueries(trpc.teams.getTeams.queryFilter({ orgId: organization.orgId }))
            queryClient.invalidateQueries(trpc.teams.getTeam.queryFilter({ orgId: organization.orgId, teamId: result.teamId }))
        }
    }))

    const isPending = createMutation.isPending || updateMutation.isPending
    
     return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>{mode == 'Create' ? 'Create Team' : 'Update Team'}</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="team-form" onSubmit={handleSubmit} {...props}>
                <FieldGroup>
                    <Field orientation="responsive">
                        <FieldContent>
                            <FieldLabel>Team ID</FieldLabel>
                        </FieldContent>
                        <S2_Value value={team.teamId} className="min-w-1/2"/>
                    </Field>

                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                                >
                                <FieldContent>
                                    <FieldLabel htmlFor="team-name">Name</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="team-name"
                                    className="min-w-1/2"
                                    maxLength={100}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Field>
                        }
                    />
                    <Show when={isIntegrationEnabled(organization, 'd4h')}>
                        <Controller
                            name="properties.d4hTeamId"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field 
                                    data-invalid={fieldState.invalid}
                                    orientation="responsive"
                                    >
                                    <FieldContent>
                                        <FieldLabel htmlFor="d4h-team-id">D4H Team ID</FieldLabel>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    </FieldContent>
                                    <S2_Input
                                        aria-invalid={fieldState.invalid}
                                        id="d4h-team-id"
                                        className="min-w-1/2"
                                        maxLength={100}
                                        value={field.value || ''}
                                        onChange={e => field.onChange(e.target.value || undefined)}
                                    />
                                </Field>
                            }
                        />
                    </Show>
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                                >
                                <FieldContent>
                                    <FieldLabel htmlFor="team-status">Status</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="team-status" className="min-w-1/2" aria-invalid={fieldState.invalid}>
                                        <S2_SelectValue placeholder="Select status" />
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
                            disabled={!form.formState.isDirty || isPending}
                            form="team-form"
                        >
                            {mode === 'Create' ? 'Create' : 'Save'}
                        </S2_Button>
                        <S2_Button 
                            type="button"
                            variant="outline" 
                            disabled={isPending} 
                            onClick={() => form.reset() } 
                            asChild
                        >
                            <Link to={mode === 'Create' ? Paths.org(organization.slug).admin.teams : Paths.org(organization.slug).admin.team(team.teamId)}>
                                Cancel
                            </Link>
                        </S2_Button>
                    </Field>
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}