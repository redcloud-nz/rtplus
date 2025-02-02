/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { DefaultD4hApiUrl } from '@/lib/d4h-api/common'
import { fieldError, FormState, fromErrorToFormState } from '@/lib/form-state'
import { EventBuilder } from '@/lib/history'
import { createUUID } from '@/lib/id'
import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'



const CreateTeamFormSchema = z.object({
    name: z.string().min(5).max(50),
    shortName: z.string().max(20),
    color: z.union([z.string().regex(/^#[0-9A-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)"), z.literal('')]),
    d4hTeamId: z.union([z.number().int("Must be an integer."), z.literal('')]),
    d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export async function createTeamAction(formState: FormState, formData: FormData): Promise<FormState> {

    const { userPersonId } = await authenticated()

    const eventBuilder = EventBuilder.create(userPersonId)

    const teamId = createUUID()
    try {
    

        const fields = CreateTeamFormSchema.parse(Object.fromEntries(formData))
        
        // Make sure the team name, short name and slug are all unique
        const nameConfict = await prisma.team.findFirst({
            where: { name: fields.name}
        })
        if(nameConfict) {
            return fieldError('name', `Team name '${fields.name}' is already taken.`)
        }

        if(fields.shortName) {
            const shortNameConflict = await prisma.team.findFirst({
                where: { shortName: fields.shortName }
            })
            if(shortNameConflict) {
                return fieldError('shortName', `Team short name '${fields.shortName}' is already taken.`)
            }
        }

        await prisma.$transaction([
            prisma.team.create({
                data: {
                    id: teamId,
                    name: fields.name,
                    shortName: fields.shortName,
                    color: fields.color,
                    d4hTeamId: fields.d4hTeamId || 0,
                    d4hApiUrl: fields.d4hApiUrl || DefaultD4hApiUrl,
                    d4hWebUrl: fields.d4hWebUrl
                }
            }),
            prisma.historyEvent.create({
                data: eventBuilder.buildEvent('Create', 'Team', teamId)
            })
        ])

    } catch(error) {
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.teams.list)
    redirect(Paths.teams.team(teamId).index)
}