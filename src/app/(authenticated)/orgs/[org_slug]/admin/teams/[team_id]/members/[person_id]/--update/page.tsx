/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]/members/[person_id]/--update
 */
'use client'


import { use } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { TeamMembershipForm } from '@/components/forms/team-membership-form'

import { useOrganization } from '@/hooks/use-organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export default function AdminModule_Team_TeamMembershipUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/members/[person_id]/--update'>) {
    const { person_id: personId, team_id: teamId } = use(props.params)

    const organization = useOrganization()

    const { data: { person, team, ...membership } } = useSuspenseQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ orgId: organization.orgId, personId, teamId }))


    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(organization.slug).admin.team(teamId).member(personId)}>
                    Team Membership
                </Hermes.BackButton>
            </Hermes.SectionHeader>

            <TeamMembershipForm
                scope="Team"
                person={person}
                team={team}
                membership={membership}
                organization={organization}
                
        />
        </Hermes.Section>
       
    </Lexington.Column>
    
}