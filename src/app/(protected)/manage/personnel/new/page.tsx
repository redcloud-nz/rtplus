/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/personnel/new
 */

import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import React from 'react'
import { z } from 'zod'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FormSubmitButton, FieldLabel, FormFooter, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'

import { fieldError, FormState, fromErrorToFormState } from '@/lib/form-state'
import { EventBuilder } from '@/lib/history'
import { createUUID } from '@/lib/id'
import prisma from '@/lib/server/prisma'
import * as Paths from '@/paths'


const CreatePersonFormSchema = z.object({
    name: z.string().max(50),
    email: z.string().email()
})

export const metadata: Metadata = { title: "New Person | RT+" }

export default async function NewPersonPage() {
    return <AppPage
        label="New Person" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Personnel", href: Paths.personnel }]}
    >
        <PageHeader>
            <PageTitle>New Person</PageTitle>
            <PageDescription>Add a person to RT+.</PageDescription>
        </PageHeader>
        <Form action={createPersonAction}>
            <FormField name="name">
                <FieldLabel>Person name</FieldLabel>
                <FieldControl>
                    <Input name="name"/>
                </FieldControl>
                <FieldDescription>The full name of the person.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="email">
                <FieldLabel>Email</FieldLabel>
                <FieldControl>
                    <Input name="email"/>
                </FieldControl>
                <FieldDescription>The email of the user (must be unique).</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormFooter>
                <FormSubmitButton label="Create" loading="Validating"/>
                <Button variant="ghost" asChild>
                    <Link href={Paths.personnel}>Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}

async function createPersonAction(formState: FormState, formData: FormData) {
    'use server'

    const { userId } = await auth.protect()

    let personId: string
    try {
        const fields = CreatePersonFormSchema.parse(Object.fromEntries(formData))

        // Make sure the email is unique
        const emailConflict = await prisma.person.findFirst({
            where: { email: fields.email }
        })
        if(emailConflict) {
            return fieldError('email', `Person email '${fields.email}' is already used by person '${emailConflict.name}'`)
        }

        const eventBuilder = EventBuilder.create(userId)
        personId = createUUID()
        
        await prisma.$transaction([
            prisma.person.create({
                data: { id: personId, name: fields.name, email: fields.email }
            }),
            prisma.historyEvent.create({ 
                data: eventBuilder.buildEvent('Create', 'Person', personId) 
            })
        ])
    } catch(error) {
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.personnel)
    redirect(Paths.person(personId))
}