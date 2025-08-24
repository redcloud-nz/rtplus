/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /teams/[team-slug]/
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'

import { fetchTeamCached } from '@/server/fetch'


export async function generateMetadata(props: { params: Promise<{ team_slug: string }> }): Promise<Metadata> {
    const team = await fetchTeamCached((await props.params).team_slug)

    return {
        applicationName: "RT+",
        title: {
            template: `%s - ${team.shortName || team.name} | RT+`,
            default: team.shortName || team.name,
        },
        description: "RT+ App",
    }
}

export default async function Team_Layout(props: { children: ReactNode }) {

    return <>{props.children}</>
}