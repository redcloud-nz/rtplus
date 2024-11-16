
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


import { fieldError, FormState, fromErrorToFormState } from '@/lib/form-state'
import prisma from '@/lib/prisma'

import { Paths } from '@/paths'

const CreateTeamFormSchema = z.object({
    teamName: z.string().min(5).max(50),
    teamCode: z.string().max(10),
})

export const metadata: Metadata = { title: "New Team | RT+" }

export default function NewTeamPage() {

    return <AppPage
        label="New Team"
        breadcrumbs={[
            { label: "Manage", href: Paths.manage },
            { label: "Teams", href: Paths.teams }
        ]}
        variant="list"    
    >
        <PageTitle>New Team</PageTitle>
        <PageDescription>Create a new team within RT+.</PageDescription>
        <Form action={createTeam}>
            <FormField name="teamName">
                <FieldLabel>Team name</FieldLabel>
                <FieldControl>
                    <Input name="teamName"/>
                </FieldControl>
                <FieldDescription>The full name of the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="teamCode">
                <FieldLabel>Short name/code</FieldLabel>
                <FieldControl>
                    <Input name="teamCode"/>
                </FieldControl>
                <FieldDescription>Short name of the team (eg NZ-RT13).</FieldDescription>
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

    let teamCode: string
    try {
        const fields = CreateTeamFormSchema.parse(Object.fromEntries(formData))
        
        // Make sure the team name and team code are unique
        const nameConfict = await prisma.team.findFirst({
            where: { name: fields.teamName }
        })
        if(nameConfict) {
            return fieldError('teamName', `Team name '${fields.teamName}' is already taken.`)
        }

        if(fields.teamCode) {
            const codeConfict = await prisma.team.findFirst({
                where: { code: fields.teamCode }
            })
            if(codeConfict) return fieldError('teamCode', `Team code '${fields.teamCode}' is already taken.`)
        }

        const createdTeam = await prisma.team.create({
            data: { name: fields.teamName, code: fields.teamCode, color: "" }
        })

        teamCode = fields.teamCode
    } catch(error) {
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.teams)
    redirect(Paths.team(teamCode))
}