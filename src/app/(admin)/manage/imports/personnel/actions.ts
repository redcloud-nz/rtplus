/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use server'

import { isEmpty } from 'remeda'

import { auth } from '@clerk/nextjs/server'
import { Person, TeamMembership } from '@prisma/client'

import { ChangeCountsByType, createChangeCounts } from '@/lib/change-counts'
import { EventBuilder } from '@/lib/history'
import prisma from '@/lib/prisma'
import { assertNonNull } from '@/lib/utils'
import { createId } from '@paralleldrive/cuid2'


export interface MemberDiff { 
    type: 'Create' | 'Update' | 'Delete',
    d4hMemberId: number
    name: string
    membershipId?: string
    personId?: string
    fields: Partial<Pick<TeamMembership, 'position' | 'd4hStatus' | 'd4hRef'> & Pick<Person, 'name' | 'email'>>
}

export interface ImportPersonnelActionResult {
    changeCounts: ChangeCountsByType<'personnel' | 'memberships'>
    elapsedTime: number
}

export async function importPersonnelAction(teamId: string, diffs: MemberDiff[]): Promise<ImportPersonnelActionResult> {

    const { userId, orgId } = await auth.protect({ role: 'org:admin' })
    assertNonNull(orgId, "An active organization is required to execute 'importPersonnelAction'")

    const startTime = Date.now()
    const changeCounts = createChangeCounts(['personnel', 'memberships'])

    const creates = diffs.filter(diff => diff.type == 'Create')
    const updates = diffs.filter(diff => diff.type == 'Update')
    //const deletes = diffs.filter(diff => diff.type == 'Delete')

    const team = await prisma.team.findFirst({
        where: { id: teamId },
        include: { 
            memberships: { 
                include: { 
                    person: true 
                }
            } 
        },
    })
    if(!team) {
        console.error(`Missing team ${teamId}`)
        throw new Error(`Missing team ${teamId}`)
    }

    const eventBuilder = EventBuilder.createGrouped(orgId, userId)
    
    await prisma.historyEvent.create({ 
        data: eventBuilder.buildRootEvent('Import', 'Team', teamId)
    })

    for(const diff of creates) {

        // See if there is already a matching person
        let personId = (await prisma.person.findFirst({ select: { id: true }, where: { name: diff.name, email: diff.fields.email } }))?.id

        if(!personId) {
            personId = createId()

            await prisma.$transaction([
                prisma.person.create({ 
                    data: { id: personId, name: diff.name, email: diff.fields.email ?? "" } 
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Create', 'Person', personId)
                })
            ])
            changeCounts.personnel.create++
        }

        const membershipId = createId()
        await prisma.$transaction([
            prisma.teamMembership.create({ 
                data: { 
                    orgId,
                    d4hMemberId: diff.d4hMemberId, 
                    position: diff.fields.position ?? "", 
                    d4hStatus: diff.fields.d4hStatus ?? 'NonOperational',
                    d4hRef: diff.fields.d4hRef ?? "",
                    personId: personId,
                    teamId: team.id,
                }
            }),
            prisma.historyEvent.create({ 
                data: eventBuilder.buildEvent('Create', 'TeamMembership', membershipId) 
            })
        ])
        changeCounts.memberships.create++
    }

    for(const diff of updates) {
        const { fields } = diff
        assertNonNull(diff.personId)
        assertNonNull(diff.membershipId)

        const personData: Partial<Record<'name' | 'email', string>> = {}
        const membershipData: Partial<Pick<TeamMembership, 'position' | 'd4hStatus' | 'd4hRef'>> = {}
        if(fields.name) personData.name = fields.name
        if(fields.email) personData.email = fields.email
        if(fields.position) membershipData.position = fields.position
        if(fields.d4hStatus) membershipData.d4hStatus = fields.d4hStatus
        if(fields.d4hRef) membershipData.d4hStatus = fields.d4hStatus
    

        if(!isEmpty(personData)) {
            await prisma.$transaction([
                prisma.person.update({
                    where: { id: diff.personId },
                    data: personData
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Update', 'Person', diff.personId)
                })
            ])
            changeCounts.personnel.update++
        }

        if(!isEmpty(membershipData)) {
            await prisma.$transaction([
                prisma.teamMembership.update({
                    where: { id: diff.membershipId },
                    data: membershipData
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Update', 'TeamMembership', diff.membershipId) 
                })
            ])
            changeCounts.memberships.update++
        }
    }

    const elapsedTime = Date.now() - startTime

    return { elapsedTime, changeCounts }
}



