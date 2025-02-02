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
import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'


const EditTeamFormSchema = z.object({
    teamId: z.string().uuid(),
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    color: z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)"), z.literal('')]),
    d4hTeamId: z.union([z.coerce.number(), z.literal('')]),
    d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export async function updateTeamAction(formState: FormState, formData: FormData) {
    
    const { userPersonId } = await authenticated()
    
    const eventBuilder = EventBuilder.create(userPersonId)

    let teamId: string
    try {
        const fields = EditTeamFormSchema.parse(Object.fromEntries(formData))
        
        // Make sure the team name and team code are unique (excluding the current record)
        const nameConfict = await prisma.team.findFirst({
            where: { name: fields.name, id: { not: fields.teamId }}
        })
        if(nameConfict) {
            return fieldError('teamName', `Team name '${fields.name}' is already taken.`)
        }


        await prisma.$transaction([
            prisma.team.update({
                where: { id: fields.teamId },
                data: { 
                    name: fields.name, 
                    shortName: fields.shortName,
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

        teamId = fields.teamId
    } catch(error) {
        console.log(error)
        return fromErrorToFormState(error)
    }

    revalidatePath(Paths.teams.list)
    revalidatePath(Paths.teams.team(teamId).index)
    redirect(Paths.teams.team(teamId).index)
}