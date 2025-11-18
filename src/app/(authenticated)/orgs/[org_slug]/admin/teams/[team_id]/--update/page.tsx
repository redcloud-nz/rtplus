/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { TeamForm } from '@/components/forms/team-form'
import { ToParentPageIcon } from '@/components/icons'
import { Link } from '@/components/ui/link'
import { S2_Button } from '@/components/ui/s2-button'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { TeamData, teamSchema } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export default function AdminModule_TeamUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/--update'>) {
    const { team_id: teamId } = use(props.params)
    
    const organization = useOrganization()
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: team } = useSuspenseQuery(trpc.teams.getTeam.queryOptions({ orgId: organization.orgId, teamId }))

    const form = useForm<TeamData>({
        resolver: zodResolver(teamSchema),
        defaultValues: { ...team }
    })

    const mutation = useMutation(trpc.teams.updateTeam.mutationOptions({
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
                form.setError(error.shape.cause.message as keyof TeamData, { message: error.shape.message })
            } else {
                    toast({
                    title: 'Error updating team',
                    description: error.message,
                    variant: 'destructive'
                })
            }
            
        },
        onSuccess() {
            toast({
                title: 'Team updated',
                description: `The team "${form.getValues().name}" has been updated.`,
            })
            
            router.push(Paths.org(organization.slug).admin.team(team.teamId).href)

            queryClient.invalidateQueries(trpc.teams.getTeams.queryFilter({ orgId: organization.orgId }))
            queryClient.invalidateQueries(trpc.teams.getTeam.queryFilter({ orgId: organization.orgId, teamId: team.teamId }))
        }
    }))

    return <Lexington.Column width="lg">
        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.team(teamId)}>
                    <ToParentPageIcon/> {team.name}
                </Link>
            </S2_Button>
        </Lexington.ColumnControls>

        <TeamForm
            mode="Update"
            form={form}
            organization={organization} 
            teamId={team.teamId}
            onSubmit={async (data) => {
                await mutation.mutateAsync({ ...data, orgId: organization.orgId })
            }} 
        />
    </Lexington.Column>
}