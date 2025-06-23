/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /teams/[team-slug]
 */

import { notFound, redirect } from 'next/navigation'

import { auth } from '@clerk/nextjs/server'

import { TeamParams } from '@/app/manage/teams/[team_slug]'




export default async function TeamLayout(props: { children: React.ReactNode,  params: Promise<TeamParams>}) {

    const {team_slug: pathSlug } = await props.params
    const { orgSlug } = await auth()

    if(orgSlug) {
        // The user is signed in to an organization

        if(pathSlug != orgSlug) {
            // The user is signed in to a different organization
            return notFound()
        } else {
            return props.children
        }
    } else {
        // The user is not signed in to an organization
        redirect(`/`)
    }

    return props.children
}