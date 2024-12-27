'use server'

import _ from 'lodash'

import { auth } from '@clerk/nextjs/server'
import { Person, TeamMembership } from '@prisma/client'

import { ChangeCountsByType, createChangeCounts } from '@/lib/change-counts'
import { recordEvent } from '@/lib/history'
import prisma from '@/lib/prisma'
import { assertNonNull } from '@/lib/utils'


export interface MemberDiff { 
    type: 'Create' | 'Update' | 'Delete',
    d4hMemberId: number
    name: string
    membershipId?: string
    personId?: string
    fields: Partial<Pick<TeamMembership, 'position' | 'status' | 'd4hRef'> & Pick<Person, 'name' | 'email'>>
}

export interface ImportPersonnelActionResult {
    changeCounts: ChangeCountsByType<'personnel' | 'memberships'>
    elapsedTime: number
}

export async function importPersonnelAction(teamId: string, diffs: MemberDiff[]): Promise<ImportPersonnelActionResult> {

    const { userId, orgId } = await auth.protect()
    assertNonNull(orgId, "An active organization is required to execute 'importPackageAction'")

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

    for(const diff of creates) {

        // See if there is already a matching person
        let person = await prisma.person.findFirst({ where: { name: diff.name, email: diff.fields.email } })

        if(!person) {
            person = await prisma.person.create({ data: { name: diff.name, email: diff.fields.email ?? "" } })

            await recordEvent('PersonCreate', { orgId, userId, description: "Imported from D4H", meta: { personId: person.id } })
            changeCounts.personnel.create++
        }

        const teamMembership = await prisma.teamMembership.create({ 
            data: { 
                orgId,
                d4hMemberId: diff.d4hMemberId, 
                position: diff.fields.position ?? "", 
                status: diff.fields.status ?? 'NonOperational',
                d4hRef: diff.fields.d4hRef ?? "",
                personId: person.id,
                teamId: team.id
            }
        })

        await recordEvent('TeamMemberAdd', { orgId, userId, description: "Imported from D4H", meta: { membershipId: teamMembership.id } })
        changeCounts.memberships.create++
    }

    for(const diff of updates) {
        const { fields } = diff
        assertNonNull(diff.personId)
        assertNonNull(diff.membershipId)

        const personData: Partial<Record<'name' | 'email', string>> = {}
        const membershipData: Partial<Pick<TeamMembership, 'position' | 'status' | 'd4hRef'>> = {}
        if(fields.name) personData.name = fields.name
        if(fields.email) personData.email = fields.email
        if(fields.position) membershipData.position = fields.position
        if(fields.status) membershipData.status = fields.status
        if(fields.d4hRef) membershipData.status = fields.status
    

        if(!_.isEmpty(personData)) {
            await prisma.person.update({
                where: { id: diff.personId },
                data: personData
            })

            await recordEvent('PersonUpdate', { orgId, userId, meta: { personId: diff.personId } })
            changeCounts.personnel.update++
        }

        if(!_.isEmpty(membershipData)) {
            await prisma.teamMembership.update({
                where: { id: diff.membershipId },
                data: membershipData
            })

            await recordEvent('TeamMemberUpdate', { orgId, userId, meta: { membershipId: diff.membershipId } })
            changeCounts.memberships.update++
        }
    }

    const elapsedTime = Date.now() - startTime

    return { elapsedTime, changeCounts }
}



