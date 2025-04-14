/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /teams/[team-slug]
 */

import { TeamParams } from '@/app/teams/[team-slug]'

export default async function PublicTeamPage({ params }: { params: Promise<TeamParams> }) {
    const { 'team-slug': teamSlug } = await params

    return <div>{`Public Team Page for ${teamSlug}`}</div>
}