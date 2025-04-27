/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team-slug]/members
 */

import { TeamParams } from '@/app/teams/[team-slug]'

export default async function TeamMembersPage(props: { params: Promise<TeamParams> }) {
    const { 'team-slug': teamSlug } = await props.params

    return <>Team Members Page: {teamSlug}</>
}