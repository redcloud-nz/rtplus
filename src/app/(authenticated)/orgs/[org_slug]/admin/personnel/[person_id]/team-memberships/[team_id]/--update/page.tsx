/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { TeamMembershipForm } from '@/components/forms/team-membership-form'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'
import { ObjectName } from '@/components/ui/typography'

import { useOrganization } from '@/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export default function AdminModule_Person_TeamMembershipUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]/--update'>) {
    const { person_id: personId, team_id: teamId } = use(props.params)

    const organization = useOrganization()

    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: { person, team, ...membership } } = useSuspenseQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ orgId: organization.orgId, personId, teamId }))

    const form = useForm<TeamMembershipData>({
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

            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ orgId: organization.orgId, teamId }))
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMembership.queryFilter({ orgId: organization.orgId, personId, teamId }))

            router.push(Paths.org(organization.slug).admin.person(personId).teamMembership(teamId).href)
        }
    }))

    return <Lexington.Column width="lg">
        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.person(personId).teamMembership(teamId)}>
                    <ToParentPageIcon/> Membership
                </Link>
            </S2_Button>
        </Lexington.ColumnControls>
       <TeamMembershipForm
            form={form}
            person={person}
            team={team}
            membership={membership}
            onSubmit={async (data) => {
                mutation.mutate({ orgId: organization.orgId, ...data })
            }}
            onCancel={() => {
                router.push(Paths.org(organization.slug).admin.person(personId).teamMembership(teamId).href)
            }}
       />
    </Lexington.Column>
    
}