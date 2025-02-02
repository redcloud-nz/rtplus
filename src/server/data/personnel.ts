/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { cache } from 'react'

import { Person, SkillPackage, SkillPackagePermission, SystemPermission, Team, TeamPermission } from '@prisma/client'

import prisma from '../prisma'


export const getPerson = cache((personId: string): Promise<Person | null> => {
    return prisma.person.findUnique({ where: { id: personId }})
})



export interface PersonPermissions { 
    skillPackagePermissions: (SkillPackagePermission & { skillPackage: SkillPackage })[], 
    systemPermissions: SystemPermission | null, 
    teamPermissions: (TeamPermission & { team: Team })[]
}

export const getPersonWithPermissions = cache((personId: string): Promise<(Person & PersonPermissions) | null> => {
    return prisma.person.findUnique({
        where: { id: personId },
        include: {
            skillPackagePermissions: { include: { skillPackage: true }},
            systemPermissions: true,
            teamPermissions: { include: { team: true }}
        }
    })
})