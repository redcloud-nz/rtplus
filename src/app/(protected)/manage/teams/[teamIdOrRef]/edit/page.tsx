/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[teamIdOrRef]/edit
 */

import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import React from 'react'
import { z } from 'zod'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { Button } from '@/components/ui/button'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FormSubmitButton, FieldLabel, FormFooter, FormMessage } from '@/components/ui/form'
import { HiddenInput, Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'

import { DefaultD4hApiUrl } from '@/lib/d4h-api/common'
import { fieldError, FormState, fromErrorToFormState } from '@/lib/form-state'
import { EventBuilder } from '@/lib/history'
import { createWhereClause } from '@/lib/id'
import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


const EditTeamFormSchema = z.object({
    teamId: z.string().uuid(),
    name: z.string().min(5).max(50),
    ref: z.string().max(10),
    color: z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)"), z.literal('')]),
    d4hTeamId: z.union([z.coerce.number(), z.literal('')]),
    d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export const metadata: Metadata = { title: "Edit Team | RT+" }

export default async function EditTeamPage(props: { params: Promise<{ teamIdOrRef: string }>}) {
    const params = await props.params

    await auth.protect()

    const team = await prisma.team.findFirst({
        where: createWhereClause(params.teamIdOrRef)
    })

    if(!team) return <NotFound label="Team"/>

    return <AppPage
        label="Edit"
        breadcrumbs={[
            { label: "Manage", href: Paths.manage },
            { label: "Teams", href: Paths.teams },
            { label: team.ref || team.name, href: Paths.team(team.ref || team.id) },
        ]}
    >
        <PageTitle>Edit Team</PageTitle>
        <Form action={updateTeam}>
            <HiddenInput name="teamId" value={team.id}/>
            <FormField name="name">
                <FieldLabel>Team name</FieldLabel>
                <FieldControl>
                    <Input name="name" defaultValue={team.name}/>
                </FieldControl>
                <FieldDescription>The full name of the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="ref">
                <FieldLabel>Short name/code</FieldLabel>
                <FieldControl>
                    <Input name="ref" className="max-w-xs" defaultValue={team.ref || ""}/>
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
                    <Link href={Paths.teams}>Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}

async function updateTeam(formState: FormState, formData: FormData) {
    'use server'

    const { userId } = await auth.protect()
    
    const eventBuilder = EventBuilder.create(userId)

    let teamIdOrRef: string
    try {
        const fields = EditTeamFormSchema.parse(Object.fromEntries(formData))
        
        // Make sure the team name and team code are unique (excluding the current record)
        const nameConfict = await prisma.team.findFirst({
            where: { name: fields.name, id: { not: fields.teamId }}
        })
        if(nameConfict) {
            return fieldError('teamName', `Team name '${fields.name}' is already taken.`)
        }

        const ref = fields.ref || null // Converts an empty string to null
        if(ref) {
            const refConflict = await prisma.team.findFirst({
                where: { ref, id: { not: fields.teamId } }
            })
            if(refConflict) return fieldError('teamRef', `Team ref '${ref}' is already taken.`)
        }

        await prisma.$transaction([
            prisma.team.update({
                where: { id: fields.teamId },
                data: { 
                    name: fields.name, 
                    ref,
                    color: fields.color.toUpperCase(),
                    d4hTeamId: fields.d4hTeamId || 0,
                    d4hApiUrl: fields.d4hApiUrl || DefaultD4hApiUrl,
                    d4hWebUrl: fields.d4hWebUrl
                }
            }),
            prisma.historyEvent.create({
                data: eventBuilder.buildEvent('Update', 'Team', fields.teamId)
            })
        ])

        teamIdOrRef = ref ?? fields.teamId
    } catch(error) {
        console.log(error)
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.teams)
    redirect(Paths.team(teamIdOrRef))
}