/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /config/teams/[team-slug]/edit
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/server'

import { UpdateTeamForm } from './update-team-form'


export const metadata: Metadata = { title: "Edit Team" }

export default async function EditTeamPage(props: { params: Promise<{ 'team-slug': string }>}) {
    const { 'team-slug': teamSlug } = await props.params

    const team = await trpc.teams.bySlug({ slug: teamSlug })

    if(!team) return <NotFound label="Team"/>

    return <AppPage
        label="Edit"
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index },
            { label: "Teams", href: Paths.config.teams.index },
            { label: team.shortName || team.name, href: Paths.config.teams.team(teamSlug).index },
        ]}
    >
        <PageTitle>Edit Team</PageTitle>
        <UpdateTeamForm team={team}/>
    </AppPage>
}