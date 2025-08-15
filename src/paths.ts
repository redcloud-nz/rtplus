/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { PolicyKeyType } from "./lib/policy"
import { TeamData } from "./lib/schemas/team"

export const about = {
    _label: 'About',
    index: '/about',
}

export const dashboard = {
    _label: 'Dashboard',
    index: '/dashboard',
}

//  /------------------------------\
//  |            System            |
//  \------------------------------/
export const system = {
    _label: 'System',
    index: '/system',

    team: (teamId: string) => {
        const teamBase = `/system/teams/${teamId}` as const

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
        index: '/system/teams',
        create: '/system/teams/--create',
    },
    person: (personId: string) => {
        const personBase = `/system/personnel/${personId}` as const
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
        index: '/system/personnel',
        create: '/system/personnel/--create',
    } as const,

    skillPackage: (skillPackageId: string) => {
        const packageBase = `/system/skill-packages/${skillPackageId}` as const

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
        index: '/system/skill-packages',
        create: '/system/skill-packages/--create',
        import: '/system/skill-packages/--import',
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

// Team

export const team = (teamOrSlug: TeamData | string) => {
    const teamSlug = typeof teamOrSlug === 'string' ? teamOrSlug : teamOrSlug.slug
    const base = `/teams/${teamSlug}/-` as const
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
                index: `${competenciesBase}/skill-checks`,
                create: {
                    _label: 'Record Check',
                    index: `${competenciesBase}/skill-checks/--create`
                },
            },
            session: (sessionId: string) => ({
                index: `${competenciesBase}/sessions/${sessionId}`
            } as const),
            sessions: {
                _label: 'Team Sessions',
                create: `${competenciesBase}/skill-check-sessions/--create`,
                index: `${competenciesBase}/skill-check-sessions`,
            },
            record: `${competenciesBase}/record`,
            reports: {
                _label: 'Reports',
                index: `${competenciesBase}/reports`,
                individual: `${competenciesBase}/reports/individual`,
                teamSkills: `${competenciesBase}/reports/team-skills`,
                teamMembers: `${competenciesBase}/reports/team-members`,
            },
        },
        dashboard: {
            _label: 'Dashboard',
            index: `${base}/dashboard`,
        },
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

export const teams = {
    select: {
        index: '/teams/--select',
        _label: 'Select Team',
    }
} as const



export const tools = {
    competencyRecorder: {
        index: `/tools/competency-recorder`,
        _label: 'Competency Recorder',

        single: {
            _label: 'Single Check',
            index: `/tools/competency-recorder/single`,
        },
        session: (sessionId: string) => {
            const sessionBase = `/tools/competency-recorder/sessions/${sessionId}`
            return {
                index: sessionBase,
                assessees: {
                    _label: 'Assessees',
                    index: `${sessionBase}/assessees`,
                },
                assessors: {
                    _label: 'Assessors',
                    index: `${sessionBase}/assessors`,
                },
                recordIndividual: {
                    _label: 'Individual',
                    index: `${sessionBase}/record-individual`,
                },
                skills: {
                    _label: 'Skills',
                    index: `${sessionBase}/skills`,
                },
                transcript: {
                    _label: 'Transcript',
                    index: `${sessionBase}/transcript`,
                },
            } as const
        },
        sessions: {
            _label: 'Sessions',
            index: '/tools/competency-recorder/sessions',
        },
    }

} as const

export const d4h = {
    _label: 'D4H Integration',
    index: '/d4h',
    activities: {
        _label: 'Activities',
        index: '/d4h/activities',
    },
    calendar: {
        _label: 'Calendar',
        index: '/d4h/calendar',

    },
    personnel: {
        _label: 'Personnel',
        index: '/d4h/personnel',
    },
    equipment: {
        _label: 'Equipment',
        index: '/d4h/equipment',
    },
} as const

//  /------------------------------\
//  |           Account            |
//  \------------------------------/
export const personal = {
    _label: 'Personal',
    index: '/personal',
    organizationList: {
        _label: 'Organizations',
        index: '/personal/organizations',
    },
    d4hAccessTokens: {
        _label: 'D4H Access Tokens',
        index: '/personal/d4h-access-tokens',
    },
    settings: {
        _label: "Personal Settings",
        index: '/personal/settings',
    },
    whoami: {
        _label: 'Who Am I',
        index: '/personal/whoami',
    },
    account: {
        _label: 'Account',
        index: '/personal/account',
    },
} as const


const docsBase = "https://github.com/redcloud-nz/rtplus/wiki"

export const documentation = {
    index: `${docsBase}`,
    glossary: `${docsBase}/glossary`,
    competencies: `${docsBase}/competencies`,
    competencyRecorder: `${docsBase}/Competency-Recorder`,
    personnel: `${docsBase}/personnel`,
    skills: `${docsBase}/skills`,
    skillGroups: `${docsBase}/skill-groups`,
    skillPackages: `${docsBase}/skill-packages`,
    teams: `${docsBase}/teams`,
    unified: `${docsBase}/unified`,
    account: `${docsBase}/account`,
}