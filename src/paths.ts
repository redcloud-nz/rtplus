/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import _ from "lodash"
import { PolicyKeyType } from "./lib/policy"

//  /------------------------------\
//  |            System            |
//  \------------------------------/
export const system = {
    _label: 'System',
    index: '/system',
    teams: {
        _label: 'Teams',
        index: '/app/system/teams',
        team: (teamId: string) => ({
            index: `/app/system/teams/${teamId}`,
            d4h: `/app/system/teams/${teamId}/d4h`,
            edit: `/app/system/teams/${teamId}/--update`,
            members: `/app/system/teams/${teamId}/members`,
        } as const),
    },
    personnel: {
        _label: 'Personnel',
        index: '/app/system/personnel',
        person: (personId: string) => ({
            index: `/app/system/personnel/${personId}`,
            update: `/app/system/personnel/${personId}/--update`,
            access: `/app/system/personnel/${personId}/access`,
            teamMemberships: {
                create: `/app/system/personnel/${personId}/team-memberships/--create`
            },
        } as const),
    },
    skillPackages: {
        _label: 'Skill Packages',
        index: '/app/system/skill-packages',
        import: '/app/system/skill-packages/--import',
        skillPackage: (skillPackageId: string) => ({
            index: `/app/system/skill-packages/${skillPackageId}`,
            groups: {
                _label: 'Groups',
                group: (skillGroupId: string) => ({
                    index: `/app/system/skill-packages/${skillPackageId}/groups/${skillGroupId}`,
                } as const),
            },
            skills: {
                _label: 'Skills',
                skill: (skillId: string) => ({
                    index: `/app/system/skill-packages/${skillPackageId}/skills/${skillId}`,
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
export const switchTeam = `/app/switch-team`

// Team

export const team = (teamSlug: string) => {
    const base = `/app/teams/${teamSlug}` as const
    const competenciesBase = `${base}/competencies` as const

    return {
        index: base,
        accept: `${base}/accept`,
        availability: `${base}/availability`,
        checklists: `${base}/checklists`,
        competencies: {
            _label: 'Competencies',
            index: competenciesBase,
            sessionList: `${competenciesBase}/sessions`,
            sessions: {
                _label: 'Competency Sessions',
                index: `${competenciesBase}/sessions`,
                session: (sessionId: string) => ({
                    index: `${competenciesBase}/sessions/${sessionId}`
                } as const)
            },
            record: `${competenciesBase}/record`,
            reportsList: `${competenciesBase}/reports`,
            reports: {
                individual: `${competenciesBase}/reports/individual`,
                teamSkills: `${competenciesBase}/reports/team-skills`,
                teamMembers: `${competenciesBase}/reports/team-members`,
            },
        },
        dashboard: `${base}/dashboard`,
        invitations: {
            _label: 'Invitations',
            index: `${base}/invitations`
        },
        members: {
            _label: 'Members',
            index: `${base}/members`,
            person: (personId: string) => ({
                index: `${base}/members/${personId}`,
            } as const)
        },
        users: {
            _label: 'Users',
            index: `${base}/users`
        },
    } as const
}

export const unified = {
    index: '/app/unified',
    activites: '/app/unified/activities',
    calendar: '/app/unified/calendar',
    personnel: '/app/unified/personnel',
    equipment: '/app/unified/equipment',
}

//  /------------------------------\
//  |           Account            |
//  \------------------------------/
export const personal = {
    index: '/app/personal/user-profile',
    organizationList: '/app/personal/organization-list',
    d4hAccessTokens: '/app/personal/d4h-access-tokens',
    whoami: '/app/personal/whoami',
    userProfile: '/app/personal/user-profile',
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