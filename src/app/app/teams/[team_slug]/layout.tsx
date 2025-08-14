/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/teams/[team-slug]
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'

import { fetchTeamBySlug } from '@/server/fetch'


export async function generateMetadata(props: { params: Promise<{ team_slug: string }> }): Promise<Metadata> {
    const team = await fetchTeamBySlug(props.params)

    return {
        applicationName: "RT+",
        title: {
            template: `%s - ${team.shortName || team.name} | RT+`,
            default: team.shortName || team.name,
        },
        description: "RT+ App",
    }
}

export default async function TeamLayout(props: { children: ReactNode }) {

    return <>{props.children}</>
}