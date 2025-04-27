/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { PolicyKeyType } from "./lib/policy"

//  /------------------------------\
//  |            System            |
//  \------------------------------/
export const system = {
    index: '/system',
    teams: {
        index: '/system/teams',
        team: (teamSlug: string) => ({
            index: `/system/teams/${teamSlug}`,
            d4h: `/system/teams/${teamSlug}/d4h`,
            edit: `/system/teams/${teamSlug}/edit`,
            members: `/system/teams/${teamSlug}/members`,
        } as const),
    },
    personnel: {
        index: '/system/personnel',
        person: (personId: string) => ({
            index: `/system/personnel/${personId}`,
            edit: `/system/personnel/${personId}/edit`,
            access: `/system/personnel/${personId}/access`,
            memberships: `/system/personnel/${personId}/memberships`,
        } as const),
    },
    skills: {
        index: '/system/skills',
        new: '/system/skills/--new',
        skill: (skillId: string) => ({
            index: `/system/skills/${skillId}`,
            edit: `/system/skills/${skillId}/edit`,
        } as const),
    },
    skillGroups: {
        index: '/system/skill-groups',
        new: '/system/skill-groups/--new',
        skillGroup: (skillGroupId: string) => ({
            index: `/system/skill-groups/${skillGroupId}`,
            edit: `/system/skill-groups/${skillGroupId}/edit`,
        } as const),
    },
    skillPackages: {
        index: '/system/skill-packages',
        import : '/system/skill-packages/--import',
        new: '/system/skill-packages/--new',
        skillPackage: (skillPackageId: string) => ({
            index: `/system/skill-packages/${skillPackageId}`,
            edit: `/system/skill-packages/${skillPackageId}/edit`,
        } as const),
    },
}

export const imports = {
    index: '/system/imports',
    personnel: '/system/imports/personnel',
    skillPackage: '/system/imports/skill-package',
} as const

export const policies = {
    index: '/policies',
    policy: (policyKey: PolicyKeyType) => `/policies/${policyKey}`,
}

// Switch Team
export const switchTeam = `/switch-team`

// Team

export const team = (teamSlug: string) => {
    const base = `/teams/${teamSlug}` as const
    const competenciesBase = `${base}/competencies` as const

    return {
        index: base,
        availability: `${base}/availability`,
        checklists: `${base}/checklists`,
        competencies: {
            overview: competenciesBase,
            sessionList: `${competenciesBase}/sessions`,
            session: (sessionId: string) => `${competenciesBase}/sessions/${sessionId}`,
            record: `${competenciesBase}/record`,
            reportsList: `${competenciesBase}/reports`,
            reports: {
                individual: `${competenciesBase}/reports/individual`,
                teamSkills: `${competenciesBase}/reports/team-skills`,
                teamMembers: `${competenciesBase}/reports/team-members`,
            },
        },
        dashboard: `${base}/dashboard`,
        members: `${base}/members`
    } as const
}

export const unified = {
    index: '/unified',
    activites: '/unified/activities',
    calendar: '/unified/calendar',
    personnel: '/unified/personnel',
    equipment: '/unified/equipment',
}

//  /------------------------------\
//  |           Account            |
//  \------------------------------/
export const personal = {
    index: '/personal/user-profile',
    organizationList: '/personal/organization-list',
    d4hAccessTokens: '/personal/d4h-access-tokens',
    whoami: '/personal/whoami',
    userProfile: '/personal/user-profile',
} as const



export const documentation = {
    index: '/documentation',
    glossary: '/documentation/glossary',
    competencies: '/documentation/competencies',
    personnel: '/documentation/personnel',
    skills: '/documentation/skills',
    skillGroups: '/documentation/skill-groups',
    skillPackages: '/documentation/skill-packages',
    teams: '/documentation/teams',
    unified: '/documentation/unified',
    account: '/documentation/account',
}