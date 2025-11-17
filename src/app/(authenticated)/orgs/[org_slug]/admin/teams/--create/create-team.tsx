/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { TeamForm } from '@/components/forms/team-form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { TeamData, TeamId, teamSchema } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





export function AdminModule_CreateTeam_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const teamId = useMemo(() => TeamId.create(), [])

    const form = useForm<TeamData>({
            resolver: zodResolver(teamSchema),
            defaultValues: {
                teamId,
                name: '',
                status: 'Active',
                tags: [],
                properties: {}
            }
        })

    const mutation = useMutation(trpc.teams.createTeam.mutationOptions({
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
                form.setError(error.shape.cause.message as keyof TeamData, { message: error.shape.message })
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
            router.push(Paths.org(organization.slug).admin.team(teamId).href)
        }
    }))

    return <TeamForm 
        mode="Create"
        form={form}
        organization={organization} 
        teamId={teamId}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}  />
}