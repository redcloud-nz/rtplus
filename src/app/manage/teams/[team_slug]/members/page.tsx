/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[team_slug]/members
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { TeamParams } from '@/app/manage/teams/[team_slug]'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'
import prisma from '@/server/prisma'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { TeamMembersListCard } from './team-members-list'



const getTeam = cache(async (teamSlug: string) => prisma.team.findUnique({ where: { slug: teamSlug } }))


export async function generateMetadata({ params }: { params: Promise<TeamParams> }): Promise<Metadata> {
    const { team_slug: teamSlug } = await params
    const team = await getTeam(teamSlug)
    if (!team) notFound()

    return { title: `Members | ${team.shortName || team.name}` }
}

export default async function TeamMembersPage({ params }: { params: Promise<TeamParams> }) {
    const { team_slug: teamSlug } = await params
    const team = await getTeam(teamSlug)
    if (!team) notFound()

    prefetch(trpc.currentTeam.members.queryOptions())

    return <AppPage>
        <AppPageBreadcrumbs
            label="Members"
            breadcrumbs={[{ label: 'Team', href: Paths.team(teamSlug).index }]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Team Members</PageTitle>
                </PageHeader>
                <TeamMembersListCard />
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}