/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { SkillCheckData } from '@/lib/schemas/skill-check'
import { SkillPackageData } from './schemas/skill-package'
import { SkillGroupData } from './schemas/skill-group'
import { SkillData } from './schemas/skill'


export type CompetenceLevel = 'NotAssessed' | 'NotTaught' | 'NotCompetent' | 'Competent' | 'HighlyConfident'

export const CompetenceLevelTerms: Record<CompetenceLevel, string> = {
    'NotAssessed': 'Not Assessed',
    'NotTaught': 'Not Taught',
    'NotCompetent': 'Not Competent',
    'Competent': 'Competent',
    'HighlyConfident': 'Highly Confident',
}

export const CompetenceLevelDescriptions: Record<CompetenceLevel, string> = {
    'NotAssessed': 'This skill has not yet been assessed.',
    'NotTaught': 'Training not complete for skill.',
    'NotCompetent': 'Unable to complete or required assistance.',
    'Competent': 'Able to complete unassisted.',
    'HighlyConfident': 'Able to complete unassisted and teach others.',
}


export type CompetenceStatus = 'None' | 'NotCompetent' | 'Competent' | 'Expired'



class CurrentCompetencyCalculator {
    private readonly skillPackages: (SkillPackageData & { skillGroups: SkillGroupData[], skills: SkillData[] })[]
    private readonly skillChecks: SkillCheckData[]

    constructor(context: { skillPackages: (SkillPackageData & { skillGroups: SkillGroupData[], skills: SkillData[] })[], skillChecks: SkillCheckData[] }) {
        this.skillPackages = context.skillPackages
        this.skillChecks = context.skillChecks.sort((a, b) => a.date.localeCompare(b.date))
    }

    private getSkillChecks(args: { assesseeId: string, skillId: string }): SkillCheckData[] {
        return this.skillChecks
            .filter(check => check.assesseeId === args.assesseeId && check.skillId === args.skillId)
    }
}