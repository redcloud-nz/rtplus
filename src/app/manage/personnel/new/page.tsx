
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
import prisma from '@/lib/prisma'

import * as Paths from '@/paths'
import { recordEvent } from '@/lib/history'
import { assertNonNull } from '@/lib/utils'

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
        <Form action={createPerson}>
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

async function createPerson(formState: FormState, formData: FormData) {
    'use server'

    const { userId, orgId } = await auth.protect({ permission: 'org:members:manage' })
    assertNonNull(orgId, "An active organization is required to execute action 'createPerson'")

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

        const createdPerson = await prisma.person.create({
            data: {
                name: fields.name,
                email: fields.email
            }
        })

        await recordEvent('CreatePerson', { orgId, userId, meta: { personId: createdPerson.id } })

        personId = createdPerson.id
    } catch(error) {
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.personnel)
    redirect(Paths.person(personId))
}