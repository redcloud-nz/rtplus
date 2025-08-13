/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { PolicyKeyType } from "./lib/policy"
import { TeamData } from "./lib/schemas/team"

export const app = {
    index: '/app',
}

export const competencies = {
    index: '/app/competencies',
    session: (sessionId: string) => ({
            index: `/app/competencies/sessions/${sessionId}`,
    } as const),
    sessions: {
        _label: 'My Sessions',
        index: '/app/competencies/sessions',
    }
} as const


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

            group: (skillGroupId: string) => ({
                index: `${packageBase}/groups/${skillGroupId}`,
                update: `${packageBase}/groups/${skillGroupId}/--update`,
                delete: `${packageBase}/groups/${skillGroupId}/--delete`,
            } as const),
            groups: {
                _label: 'Groups',
                create: `${packageBase}/groups/--create`,
            },

            skill: (skillId: string) => ({
                index: `${packageBase}/skills/${skillId}`,
                update: `${packageBase}/skills/${skillId}/--update`,
                delete: `${packageBase}/skills/${skillId}/--delete`,
            } as const),
            skills: {
                _label: 'Skills',
                create: `${packageBase}/skills/--create`,
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
export const selectTeam = {
    index: '/app/select-team',
    _label: 'Select Team',
}

// Team

export const team = (teamOrSlug: TeamData | string) => {
    const teamSlug = typeof teamOrSlug === 'string' ? teamOrSlug : teamOrSlug.slug
    const base = `/app/teams/${teamSlug}` as const
    const competenciesBase = `${base}/competencies` as const

    return {
        index: base,
        _label: typeof teamOrSlug === 'string' ? undefined as never : (teamOrSlug.shortName || teamOrSlug.name),
        accept: `${base}/accept`,
        availability: `${base}/availability`,
        checklists: `${base}/checklists`,
        competencies: {
            _label: 'Competencies',
            index: competenciesBase,
            checks: {
                _label: 'Checks',
                index: `${competenciesBase}/checks`,
                create: {
                    _label: 'Record Check',
                    index: `${competenciesBase}/checks/--create`
                },
            },
            session: (sessionId: string) => ({
                index: `${competenciesBase}/sessions/${sessionId}`
            } as const),
            sessions: {
                _label: 'Team Sessions',
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
        member: (personId: string) => ({
            index: `${base}/members/${personId}`,
        } as const),
        members: {
            _label: 'Members',
            index: `${base}/members`,
            create: `${base}/members/--create`,
        },
        users: {
            _label: 'Users',
            index: `${base}/users`
        },
    } as const
}

export const d4h = {
    _label: 'D4H Integration',
    index: '/app/d4h',
    activities: {
        _label: 'Activities',
        index: '/app/d4h/activities',
    },
    calendar: {
        _label: 'Calendar',
        index: '/app/d4h/calendar',
        
    },
    personnel: {
        _label: 'Personnel',
        index: '/app/d4h/personnel',
    },
    equipment: {
        _label: 'Equipment',
        index: '/app/d4h/equipment',
    },
} as const

//  /------------------------------\
//  |           Account            |
//  \------------------------------/
export const personal = {
    _label: 'Personal',
    index: '/app/personal',
    organizationList: {
        _label: 'Organizations',
        index: '/app/personal/organizations',
    },
    d4hAccessTokens: {
        _label: 'D4H Access Tokens',
        index: '/app/personal/d4h-access-tokens',
    },
    whoami: {
        _label: 'Who Am I',
        index: '/app/personal/whoami',
    },
    account: {
        _label: 'Account',
        index: '/app/personal/account',
    },
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