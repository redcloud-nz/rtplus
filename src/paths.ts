/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { PolicyKeyType } from "./lib/policy"


//  /------------------------------\
//  |            System            |
//  \------------------------------/
export const system = {
    _label: 'System',
    index: '/app/system',

    team: (teamId: string) => {
        const teamBase = `/app/system/teams/${teamId}` as const

        return {
            index: teamBase,
            d4h: `${teamBase}/d4h-integration`,

            update: `${teamBase}/--update`,
            delete: `${teamBase}/--delete`,
            member: (personId: string) => ({
                    index: `${teamBase}/members/${personId}`,
                    update: `${teamBase}/members/${personId}/--update`,
                    delete: `${teamBase}/members/${personId}/--delete`,
            } as const),
            members: {
                _label: 'Members',
                index: `${teamBase}/members`,
                create: `${teamBase}/members/--create`,
            }
        } as const
    },
    teams: {
        _label: 'Teams',
        index: '/app/system/teams',
        create: '/app/system/teams/--create',
    },
    person: (personId: string) => {
        const personBase = `/app/system/personnel/${personId}` as const
        return {
            index: personBase,
            update: `${personBase}/--update`,
            delete: `${personBase}/--delete`,
            access: `${personBase}/access`,

            teamMembership: (teamId: string) => ({
                index: `${personBase}/team-memberships/${teamId}`,
                update: `${personBase}/team-memberships/${teamId}/--update`,
                delete: `${personBase}/team-memberships/${teamId}/--delete`,
            } as const),

            teamMemberships: {
                    _label: 'Team Memberships',
                    index: `${personBase}/team-memberships`,
                    create: `${personBase}/team-memberships/--create`,
            },
        } as const
    },
    personnel: {
        _label: 'Personnel',
        index: '/app/system/personnel',
        create: '/app/system/personnel/--create',
    } as const,

    skillPackage: (skillPackageId: string) => {
        const packageBase = `/app/system/skill-packages/${skillPackageId}` as const

        return {
            index: packageBase,
            update: `${packageBase}/--update`,
            delete: `${packageBase}/--delete`,
            createGroup: `${packageBase}/--create-group`,
            createSkill: `${packageBase}/--create-skill`,

            group: (skillGroupId: string) => ({
                index: `${packageBase}/groups/${skillGroupId}`,
                update: `${packageBase}/groups/${skillGroupId}/--update`,
                delete: `${packageBase}/groups/${skillGroupId}/--delete`,
            } as const),
            groups: {
                _label: 'Groups',
            },

            skill: (skillId: string) => ({
                index: `${packageBase}/skills/${skillId}`,
                update: `${packageBase}/skills/${skillId}/--update`,
                delete: `${packageBase}/skills/${skillId}/--delete`,
            } as const),
            skills: {
                _label: 'Skills',
            },
        } as const
    }, 
    skillPackages: {
        _label: 'Skill Packages',
        index: '/app/system/skill-packages',
        create: '/app/system/skill-packages/--create',
        import: '/app/system/skill-packages/--import',
    } as const,
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
            session: (sessionId: string) => ({
                index: `${competenciesBase}/sessions/${sessionId}`
            } as const),
            sessions: {
                _label: 'Sessions',
                create: `${competenciesBase}/sessions/--create`,
                index: `${competenciesBase}/sessions`,
            },
            record: `${competenciesBase}/record`,
            reports: {
                index: `${competenciesBase}/reports`,
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