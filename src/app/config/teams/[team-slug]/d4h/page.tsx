/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/teams/[team-slug]/d4h
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/server'

import { UpdateTeamD4hForm } from './update-team-d4h-form'


export const metadata: Metadata = { title: "TeamD4h" }

export default async function TeamD4hPage(props: { params: Promise<{ 'team-slug': string }>}) {
    const { 'team-slug': teamSlug } = await props.params

    const team = await trpc.teams.bySlug({ slug: teamSlug })
    const d4hInfo = await trpc.teams.d4hInfoBySlug({ slug: teamSlug })

    if(!team) return <NotFound label="Team"/>

    return <AppPage
        label="D4H Configuration"
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index },
            { label: "Teams", href: Paths.config.teams.index },
            { label: team.shortName || team.name, href: Paths.config.teams.team(teamSlug).index },
        ]}
    >
        <PageTitle>Edit Team</PageTitle>
        <UpdateTeamD4hForm team={team} d4hInfo={d4hInfo}/>
    </AppPage>
}