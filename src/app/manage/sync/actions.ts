'use server'

import _ from 'lodash'

import { CapabilityList, SkillGroupList, SkillList } from '@/data/skills'
import { BasicD4hMember, toTeamMembershipStatus } from '@/lib/d4h-api/member'
import prisma from '@/lib/prisma'
import { ChangeCountsByType, createEmptyChangeCounts as createChangeCounts } from '@/lib/change-counts'

export interface  SyncPersonnelActionResult {
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



export interface SyncSkillsActionResult {
    changeCounts: ChangeCountsByType<'capabilities' | 'skillGroups' | 'skills'>
    elapsedTime: number
}


export async function syncSkillsAction(): Promise<SyncSkillsActionResult> {

    const startTime = Date.now()
    const changeCounts = createChangeCounts(['capabilities', 'skillGroups', 'skills'])

    const storedCapabilities = await prisma.capability.findMany()
    const storedSkillGroups = await prisma.skillGroup.findMany()
    const storedSkills = await prisma.skill.findMany()

    // Capabilities that are in the sample set but not the stored set
    const capabilitesToAdd = _.differenceBy(CapabilityList, storedCapabilities, (c) => c.id)

    if(capabilitesToAdd.length > 0) {
        await prisma.capability.createMany({
            data: capabilitesToAdd.map(capability => _.pick(capability, ['id', 'name', 'ref']))
        })
        changeCounts.capabilities.create = capabilitesToAdd.length
    }

    // Capabilites that could need updating
    for(const sampleCapability of CapabilityList) {
        const storedCapability = storedCapabilities.find(c => c.id == sampleCapability.id)
        if(!storedCapability) continue // New capability

        if(sampleCapability.name != storedCapability.name || sampleCapability.ref != storedCapability.ref) {
            await prisma.capability.update({
                where: { id: sampleCapability.id },
                data: _.pick(sampleCapability, ['name', 'ref'])
            })
            changeCounts.capabilities.update++
        }
    }

    // Skill Groups that are in the sample set but not in the stored set
    const groupsToAdd = _.differenceBy(SkillGroupList, storedSkillGroups, (c) => c.id)

    if(groupsToAdd.length > 0) {
        await prisma.skillGroup.createMany({
            data: groupsToAdd.map(group => _.pick(group, ['id', 'name', 'capabilityId']))
        })
        changeCounts.skillGroups.create = groupsToAdd.length
    }

    // Skill Groups that could need updating
    for(const sampleGroup of SkillGroupList) {
        const storedGroup = storedSkillGroups.find(c => c.id == sampleGroup.id)
        if(!storedGroup) continue // New group

        if(sampleGroup.name != storedGroup.name) {
            await prisma.skillGroup.update({
                where: { id: sampleGroup.id },
                data: _.pick(sampleGroup, ['name', 'ref', 'capabilityId'])
            })
            changeCounts.skillGroups.update++
        }
    }

    // Skills that are in the sample set but not in the stored set
    const skillsToAdd = _.differenceBy(SkillList, storedSkills, (c) => c.id)

    if(skillsToAdd.length > 0) {
        await prisma.skill.createMany({
            data: skillsToAdd.map(skill => _.pick(skill, ['id', 'name', 'ref', 'description', 'frequency', 'optional', 'skillGroupId']))
        })
        changeCounts.skills.create = skillsToAdd.length
    }

    // Skills that could need updating
    for(const sampleSkill of SkillList) {
        const storedSkill = storedSkills.find(c => c.id == sampleSkill.id)
        if(!storedSkill) continue // New skill

        if(sampleSkill.name != storedSkill.name || sampleSkill.ref != storedSkill.ref || sampleSkill.description != storedSkill.description || sampleSkill.frequency != storedSkill.frequency || sampleSkill.optional != storedSkill.optional) {
            await prisma.skill.update({
                where: { id: sampleSkill.id },
                data: _.pick(sampleSkill, ['name', 'ref', 'description', 'frequency', 'optional', 'skillGroupId'])
            })
            changeCounts.skills.update++
        }
    }


    const elapsedTime = Date.now() - startTime

    return { changeCounts, elapsedTime }
}