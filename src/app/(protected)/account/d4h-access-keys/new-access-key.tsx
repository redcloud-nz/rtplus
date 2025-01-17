/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'
import { z } from 'zod'

import { Team } from '@prisma/client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FieldControl, FieldDescription, FieldLabel, FieldMessage, Form, FormField, FormFooter, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'

import { getD4hFetchClient } from '@/lib/d4h-api/client'
import { D4hWhoami } from '@/lib/d4h-api/whoami'
import { FormState, fromErrorToFormState, toFormState } from '@/lib/form-state'
import { assertNonNull } from '@/lib/utils'

import { createAccessKey } from './actions'


const NewAccessKeyFormSchema = z.object({
    accessKey: z.string().min(10),
    teamId: z.string().uuid()
})

export interface NewAccessKeyDialogProps {
    children: React.ReactNode
    teams: Team[]
}


export function NewAccessKeyDialog({ children, teams }: NewAccessKeyDialogProps) {
    const [open, setOpen] = React.useState(false)
   
    function handleOpenChange(newValue: boolean) {
        if(newValue) setOpen(true)
        else handleClose()
    }

    function handleClose() {
        setOpen(false)
    }

    async function validateAccessKey(formState: FormState, formData: FormData): Promise<FormState> {

        try {
            const fields = NewAccessKeyFormSchema.parse(Object.fromEntries(formData))

            const team = teams.find(team => team.id == fields.teamId)
            assertNonNull(team, 'Team must be selected.')

            const keyRef = { id: '', key: fields.accessKey, team }

            // Check that the access key allows us to connect to D4H.
            const { data, error } = await getD4hFetchClient(keyRef, { cache: false }).GET('/v3/whoami')

            if(error) {
                return toFormState('ERROR', error)
            }
            if(data) {
                const member = (data as D4hWhoami).members.find(member => member.permissions)
                if(!member) return toFormState('ERROR', "Your access key is valid but doesn't grant access to any teams.")

                if(team.d4hTeamId == 0 ? member.owner.title != team.name : member.owner.id == team.d4hTeamId) {
                    return toFormState('ERROR', `Your access key provides access to '${member.owner.title}' but you selected '${team.name}'`)
                }
                
                await createAccessKey({ accessKey: fields.accessKey, teamId: fields.teamId, d4hTeamId: member.owner.id })

                handleClose()
            }
            
        } catch(error) {
            return fromErrorToFormState(error)
        }
        return toFormState('SUCCESS', "")
    }

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Access Key</DialogTitle>
                <DialogDescription>Paste your access key here.</DialogDescription>
            </DialogHeader>
            <Form action={validateAccessKey}>
                <FormField name="accessKey">
                    <FieldLabel>Access key</FieldLabel>
                    <FieldControl>
                        <Input name="accessKey" placeholder="Paste your access key here..."/>
                    </FieldControl>
                    <FieldMessage/>
                </FormField>
                <FormField name="teamId">
                    <FieldLabel>Team</FieldLabel>
                    <FieldControl>
                        <Select name="teamId">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a team"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Teams</SelectLabel>
                                    {teams.map(team => 
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FieldControl>
                    <FieldDescription>
                        The team that this access key connects to.
                    </FieldDescription>
                    <FieldMessage/>
                </FormField>
                <FormFooter>
                    <FormSubmitButton label="Validate" loading="Validating"/>
                </FormFooter>
                <FormMessage/>
            </Form>
        </DialogContent>
    </Dialog>
}

