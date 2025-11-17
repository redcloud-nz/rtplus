/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]
 */

import { TITLE_SEPARATOR } from '@/lib/utils'
import { getOrganization } from '@/server/organization'
import { getTeam } from '@/server/team'

export async function generateMetadata(props: LayoutProps<'/orgs/[org_slug]/admin/teams/[team_id]'>) {
    const { org_slug: orgSlug, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)

    const team = await getTeam(organization.orgId, teamId)

    return { title: `${team.name} ${TITLE_SEPARATOR} Teams` }
}

export default async function AdminModule_Team_Layout(props: LayoutProps<'/orgs/[org_slug]/admin/teams/[team_id]'>) {

    return props.children
}