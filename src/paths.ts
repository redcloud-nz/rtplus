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
        create: '/system/teams/--create',
        team: (teamId: string) => ({
            index: `/system/teams/${teamId}`,
            d4h: `/system/teams/${teamId}/d4h`,
            edit: `/system/teams/${teamId}/--update`,
            members: `/system/teams/${teamId}/members`,
        } as const),
    },
    personnel: {
        index: '/system/personnel',
        create: '/system/personnel/--create',
        person: (personId: string) => ({
            index: `/system/personnel/${personId}`,
            update: `/system/personnel/${personId}/--update`,
            access: `/system/personnel/${personId}/access`,
            teamMemberships: {
                create: `/system/personnel/${personId}/team-memberships/--create`
            },
        } as const),
    },
    skillPackages: {
        index: '/system/skill-packages',
        import: '/system/skill-packages/--import',
        skillPackage: (skillPackageId: string) => ({
            index: `/system/skill-packages/${skillPackageId}`,
            groups: {
                index: `/system/skill-packages/${skillPackageId}/groups`,
                group: (skillGroupId: string) => ({
                    index: `/system/skill-packages/${skillPackageId}/groups/${skillGroupId}`,
                } as const),
            },
            skills: {
                index: `/system/skill-packages/${skillPackageId}/skills`,
                skill: (skillId: string) => ({
                    index: `/system/skill-packages/${skillPackageId}/skills/${skillId}`,
                } as const),
            },
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
    const base = `/manage/teams/${teamSlug}` as const
    const competenciesBase = `${base}/competencies` as const

    return {
        index: base,
        accept: `${base}/accept`,
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
        invitations: `${base}/invitations`,
        members: {
            index: `${base}/members`,
            person: (personId: string) => ({
                index: `${base}/members/${personId}`,
            } as const)
        },
        users: `${base}/users`,
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