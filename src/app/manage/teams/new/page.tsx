
import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FormSubmitButton, FieldLabel, FormFooter, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'

import { createTeam } from '../actions'

export const metadata: Metadata = { title: "New Team | RT+" }

export default function NewTeamPage() {

    return <AppPage
        label="New Team"
        breadcrumbs={[
            { label: "Manage", href: "/manage" },
            { label: "Teams", href: "/manage/teams" }
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
                    <Link href="/manage/teams">Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}