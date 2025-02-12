/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[teamSlug]/edit
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Button } from '@/components/ui/button'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FormSubmitButton, FieldLabel, FormFooter, FormMessage } from '@/components/ui/form'
import { HiddenInput, Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'

import { DefaultD4hApiUrl } from '@/lib/d4h-api/common'
import { validateUUID } from '@/lib/id'
import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'

import { updateTeamAction } from './update-team-action'


export const metadata: Metadata = { title: "Edit Team" }

export default async function EditTeamPage(props: { params: Promise<{ teamId: string }>}) {
    const { teamId } = await props.params
    if(!validateUUID(teamId)) throw new Error(`Invalid teamId (${teamId}) in path`)

    await authenticated()

    const team = await prisma.team.findUnique({
        where: { id: teamId },
    })

    if(!team) return <NotFound label="Team"/>

    return <AppPage
        label="Edit"
        breadcrumbs={[
            { label: "Manage", href: Paths.system },
            { label: "Teams", href: Paths.teams.list },
            { label: team.shortName || team.name, href: Paths.teams.team(teamId).index },
        ]}
    >
        <PageTitle>Edit Team</PageTitle>
        <Form action={updateTeamAction}>
            <HiddenInput name="teamId" value={team.id}/>
            <FormField name="name">
                <FieldLabel>Team name</FieldLabel>
                <FieldControl>
                    <Input name="name" defaultValue={team.name}/>
                </FieldControl>
                <FieldDescription>The full name of the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="shortName">
                <FieldLabel>Short name</FieldLabel>
                <FieldControl>
                    <Input name="shortName" className="max-w-xs" defaultValue={team.shortName || ""}/>
                </FieldControl>
                <FieldDescription>Short name of the team (eg NZ-RT13).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="color">
                <FieldLabel>Team colour</FieldLabel>
                <FieldControl>
                    <Input name="color" className="max-w-xs" defaultValue={team.color}/>
                </FieldControl>
                <FieldDescription>Highlight colour applied to help differentiate from other teams (optional).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="d4hTeamId">
                <FieldLabel>D4H Team ID</FieldLabel>
                <FieldControl>
                    <Input name="d4hTeamId" className="max-w-xs" type="number" defaultValue={team.d4hTeamId ?? ""}/>
                </FieldControl>
                <FieldDescription>D4H Team ID (If known).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="d4hApiUrl">
                <FieldLabel>D4H API URL</FieldLabel>
                <FieldControl>
                    <Input name="d4hApiUrl" placeholder={DefaultD4hApiUrl} defaultValue={team.d4hApiUrl}/>
                </FieldControl>
                <FieldDescription>Base URL of the D4H Team Manager API for the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="d4hWebUrl">
                <FieldLabel>D4H Web URL</FieldLabel>
                <FieldControl>
                    <Input name="d4hWebUrl" defaultValue={team.d4hWebUrl}/>
                </FieldControl>
                <FieldDescription>The Web URL of the D4H Team Manager for the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormFooter>
                <FormSubmitButton label="Update" loading="Validating"/>
                <Button variant="ghost" asChild>
                    <Link href={Paths.teams.team(teamId).index}>Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}