/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/new
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Form, FieldControl, FieldDescription, FormField, FieldMessage, FormSubmitButton, FieldLabel, FormFooter, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/components/ui/link'

import { DefaultD4hApiUrl } from '@/lib/d4h-api/common'
import * as Paths from '@/paths'

import { createTeamAction } from './create-team-action'


export const metadata: Metadata = { title: "New Team | RT+" }

export default function NewTeamPage() {

    return <AppPage
        label="New Team"
        breadcrumbs={[
            { label: "Manage", href: Paths.manage },
            { label: "Teams", href: Paths.teams.list }
        ]}    
    >
        <PageTitle>New Team</PageTitle>
        <PageDescription>Create a new team.</PageDescription>
        <Form action={createTeamAction}>
            <FormField name="name">
                <FieldLabel>Team name</FieldLabel>
                <FieldControl>
                    <Input name="name"/>
                </FieldControl>
                <FieldDescription>The full name of the team.</FieldDescription>
                <FieldMessage/>
            </FormField>
            <FormField name="shortName">
                <FieldLabel>Short name</FieldLabel>
                <FieldControl>
                    <Input name="shortName" className="max-w-xs"/>
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
                    <Link href={Paths.teams.list}>Cancel</Link>
                </Button>
            </FormFooter>
            <FormMessage/>
        </Form>
    </AppPage>
}