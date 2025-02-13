/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import type { D4hAccessKey, Skill, SkillGroup, SkillPackage, Team } from '@prisma/client'

export type D4hAccessKeyWithTeam = D4hAccessKey & { team: Team }

export type SkillPackageWithGroupsAndSkills = SkillPackage & { 
    skillGroups: SkillGroup[]
    skills: Skill[]
}

export class FieldConflictError extends Error {
    constructor(fieldName: string) {
        super(fieldName)
        this.name = 'FieldConflictError'
    }
}