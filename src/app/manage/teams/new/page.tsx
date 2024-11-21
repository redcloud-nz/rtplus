
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import React from 'react'
import { z } from 'zod'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FormSubmitButton, FieldLabel, FormFooter, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'

import { DefaultD4hApiUrl } from '@/lib/d4h-api/client'
import { fieldError, FormState, fromErrorToFormState } from '@/lib/form-state'
import prisma from '@/lib/prisma'

import * as Paths from '@/paths'

const CreateTeamFormSchema = z.object({
    name: z.string().min(5).max(50),
    code: z.string().max(10),
    color: z.union([z.string().regex(/^#[0-9A-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)"), z.literal('')]),
    d4hTeamId: z.union([z.number().int("Must be an integer."), z.literal('')]),
    d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export const metadata: Metadata = { title: "New Team | RT+" }

export default function NewTeamPage() {

    return <AppPage
        label="New Team"
        breadcrumbs={[
            { label: "Manage", href: Paths.manage },
            { label: "Teams", href: Paths.teams }
        ]}    
    >
        <PageTitle>New Team</PageTitle>
        <PageDescription>Create a new team within RT+.</PageDescription>
        <Form action={createTeam}>
            <FormField name="name">
                <FieldLabel>Team name</FieldLabel>
                <FieldControl>
                    <Input name="name"/>
                </FieldControl>
                <FieldDescription>The full name of the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="code">
                <FieldLabel>Short name/code</FieldLabel>
                <FieldControl>
                    <Input name="code" className="max-w-xs"/>
                </FieldControl>
                <FieldDescription>Short name of the team (eg NZ-RT13).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="color">
                <FieldLabel>Team colour</FieldLabel>
                <FieldControl>
                    <Input name="color" className="max-w-xs"/>
                </FieldControl>
                <FieldDescription>Highlight colour applied to help differentiate from other teams (optional).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="d4hTeamId">
                <FieldLabel>D4H Team ID</FieldLabel>
                <FieldControl>
                    <Input name="d4hTeamId" className="max-w-xs" type="number"/>
                </FieldControl>
                <FieldDescription>D4H Team ID (If known).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="d4hApiUrl">
                <FieldLabel>D4H API URL</FieldLabel>
                <FieldControl>
                    <Input name="d4hApiUrl" placeholder={DefaultD4hApiUrl}/>
                </FieldControl>
                <FieldDescription>Base URL of the D4H Team Manager API for the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="d4hWebUrl">
                <FieldLabel>D4H Web URL</FieldLabel>
                <FieldControl>
                    <Input name="d4hWebUrl"/>
                </FieldControl>
                <FieldDescription>The Web URL of the D4H Team Manager for the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormFooter>
                <FormSubmitButton label="Create" loading="Validating"/>
                <Button variant="ghost" asChild>
                    <Link href={Paths.teams}>Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}

async function createTeam(formState: FormState, formData: FormData) {
    'use server'

    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'createTeam'")

    let teamIdOrCode: string
    try {
        const fields = CreateTeamFormSchema.parse(Object.fromEntries(formData))
        
        // Make sure the team name and team code are unique
        const nameConfict = await prisma.team.findFirst({
            where: { name: fields.name}
        })
        if(nameConfict) {
            return fieldError('teamName', `Team name '${fields.name}' is already taken.`)
        }

        if(fields.code) {
            const codeConfict = await prisma.team.findFirst({
                where: { code: fields.code }
            })
            if(codeConfict) return fieldError('teamCode', `Team code '${fields.code}' is already taken.`)
        }

        const createdTeam = await prisma.team.create({
            data: { 
                name: fields.name, 
                code: fields.code, 
                color: fields.color,
                d4hTeamId: fields.d4hTeamId || 0,
                d4hApiUrl: fields.d4hApiUrl || DefaultD4hApiUrl,
                d4hWebUrl: fields.d4hWebUrl
            }
        })

        teamIdOrCode = fields.code || createdTeam.id
    } catch(error) {
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.teams)
    redirect(Paths.team(teamIdOrCode))
}