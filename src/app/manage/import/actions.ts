'use server'

import _ from 'lodash'

import { BasicD4hMember, toTeamMembershipStatus } from '@/lib/d4h-api/member'
import prisma from '@/lib/prisma'
import { ChangeCountsByType, createEmptyChangeCounts as createChangeCounts } from '@/lib/change-counts'

export interface SyncPersonnelActionResult {
    elapsedTime: number
    insertCount: number 
    updateCount: number
}

export async function syncPersonnelAction(teamIds: string[], members: BasicD4hMember[]): Promise<SyncPersonnelActionResult> {

    const startTime = Date.now()

    let insertCount = 0
    let updateCount = 0

    for(const teamId of teamIds) {
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
            continue
        }

        const d4hMembers = members.filter(member => member.owner.id == team.d4hTeamId)

        for(const d4hMember of d4hMembers) {
            
            const teamMembership = team.memberships.find(membership => membership.d4hMemberId == d4hMember.id)

            if(teamMembership) {
                // Membership is already defined in RT+.
                const person = teamMembership.person
                let modified = false

                // Update the person if different
                if(d4hMember.name != person.name || d4hMember.email.value != person.email) {
                    await prisma.person.update({
                        where: { id: teamMembership.personId },
                        data: { name: d4hMember.name, email: d4hMember.email.value }
                    })
                    modified = true
                }
                
                const status = toTeamMembershipStatus(d4hMember.status)

                // Update the membership if different
                if(d4hMember.position != teamMembership.position || d4hMember.ref != teamMembership.d4HRef || status != teamMembership.status) {
                    await prisma.teamMembership.update({
                        where: { id: teamMembership.id },
                        data: {
                            position: d4hMember.position,
                            d4HRef: d4hMember.ref,
                            status,
                        }
                    })
                    modified = true
                }
                
                if(modified) updateCount++

            } else {
                // Membership is not yet defined in Rt+.
                
                // Look for a person with a matching name and email, or create one if not found
                const person = await prisma.person.findFirst({ 
                    where: { name: d4hMember.name, email: d4hMember.email.value }
                }) ?? await prisma.person.create({
                    data: { name: d4hMember.name, email: d4hMember.email.value }
                })

                await prisma.teamMembership.create({
                    data: { 
                        position: d4hMember.position,
                        status: toTeamMembershipStatus(d4hMember.status),
                        d4hMemberId: d4hMember.id,
                        d4HRef: d4hMember.ref,
                        personId: person.id,
                        teamId,
                    }
                })
                insertCount++
            }
        }
    }

    const elapsedTime = Date.now() - startTime

    return { elapsedTime, insertCount, updateCount }
}



