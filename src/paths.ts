/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { CableIcon, PocketKnifeIcon, ShieldHalfIcon, UsersIcon } from 'lucide-react'

import { TeamData } from '@/lib/schemas/team'

export const about = {
    label: 'About',
    href: '/about',
}

export const dashboard = {
    label: 'Dashboard',
    href: '/dashboard',
}

export const fog = {
    label: 'Field Operations Guide',
    href: '/fog',
} as const


export const referenceCards = {
    label: 'Reference Cards',
    href: '/cards'
} as const

export const selectTeam = {
    label: "Select Team",
    href: '/select-team'
} as const

export const system = {
    label: 'System',
    href: '/system',

    team: (teamId: string) => {
        const teamBase = `/system/teams/${teamId}` as const

        return {
            href: teamBase,
            d4h: `${teamBase}/d4h-integration`,

            update: `${teamBase}/--update`,
            delete: `${teamBase}/--delete`,
            member: (personId: string) => ({
                    href: `${teamBase}/members/${personId}`,
                    update: `${teamBase}/members/${personId}/--update`,
                    delete: `${teamBase}/members/${personId}/--delete`,
            } as const),
            members: {
                label: 'Members',
                href: `${teamBase}/members`,
                create: `${teamBase}/members/--create`,
            }
        } as const
    },
    teams: {
        label: 'Teams',
        href: '/system/teams',
        icon: ShieldHalfIcon,
        create: '/system/teams/--create',
    },
    person: (personId: string) => {
        const personBase = `/system/personnel/${personId}` as const
        return {
            href: personBase,
            update: `${personBase}/--update`,
            delete: `${personBase}/--delete`,
            access: `${personBase}/access`,

            teamMembership: (teamId: string) => ({
                href: `${personBase}/team-memberships/${teamId}`,
                update: `${personBase}/team-memberships/${teamId}/--update`,
                delete: `${personBase}/team-memberships/${teamId}/--delete`,
            } as const),

            teamMemberships: {
                    label: 'Team Memberships',
                    href: `${personBase}/team-memberships`,
                    create: `${personBase}/team-memberships/--create`,
            },
        } as const
    },
    personnel: {
        label: 'Personnel',
        href: '/system/personnel',
        icon: UsersIcon,
        create: '/system/personnel/--create',

        import: {
            label: 'Import Personnel',
            href: '/system/personnel/--import',
        }
    } as const,

    skillPackage: (skillPackageId: string) => {
        const packageBase = `/system/skill-packages/${skillPackageId}` as const

        return {
            href: packageBase,
            update: `${packageBase}/--update`,
            delete: `${packageBase}/--delete`,

            group: (skillGroupId: string) => ({
                href: `${packageBase}/groups/${skillGroupId}`,
                update: `${packageBase}/groups/${skillGroupId}/--update`,
                delete: `${packageBase}/groups/${skillGroupId}/--delete`,
            } as const),
            groups: {
                label: 'Groups',
                create: `${packageBase}/groups/--create`,
            },

            skill: (skillId: string) => ({
                href: `${packageBase}/skills/${skillId}`,
                update: `${packageBase}/skills/${skillId}/--update`,
                delete: `${packageBase}/skills/${skillId}/--delete`,
            } as const),

            skills: {
                label: 'Skills',
                create: `${packageBase}/skills/--create`,
            },
        } as const
    }, 
    skillPackages: {
        label: 'Skill Packages',
        href: '/system/skill-packages',
        icon: PocketKnifeIcon,
        create: '/system/skill-packages/--create',
        import: {
            label: 'Import Skill Package',
            href: '/system/skill-packages/--import',
        }
    } as const,
}



export const team = (teamOrSlug: TeamData | string) => {
    const teamSlug = typeof teamOrSlug === 'string' ? teamOrSlug : teamOrSlug.slug
    const base = `/teams/${teamSlug}/-` as const
    const competenciesBase = `${base}/competencies` as const

    return {
        href: base,
        label: typeof teamOrSlug === 'string' ? undefined as never : (teamOrSlug.shortName || teamOrSlug.name),
        accept: `${base}/accept`,
        availability: `${base}/availability`,
        checklists: `${base}/checklists`,
        competencies: {
            label: 'Competencies',
            href: competenciesBase,
            icon: PocketKnifeIcon,
            checks: {
                label: 'Checks',
                href: `${competenciesBase}/skill-checks`,
                create: {
                    label: 'Record Check',
                    href: `${competenciesBase}/skill-checks/--create`
                },
            },
            session: (sessionId: string) => ({
                href: `${competenciesBase}/sessions/${sessionId}`
            } as const),
            sessions: {
                label: 'Team Sessions',
                create: `${competenciesBase}/skill-check-sessions/--create`,
                href: `${competenciesBase}/skill-check-sessions`
            },
            record: `${competenciesBase}/record`,
            reports: {
                label: 'Reports',
                href: `${competenciesBase}/reports`,
                individual: `${competenciesBase}/reports/individual`,
                teamSkills: `${competenciesBase}/reports/team-skills`,
                teamMembers: `${competenciesBase}/reports/team-members`,
            },
        },
        dashboard: {
            label: 'Dashboard',
            href: `${base}/dashboard`
        },
        invitations: {
            label: 'Invitations',
            href: `${base}/invitations`
        },
        member: (personId: string) => ({
            href: `${base}/members/${personId}`
        } as const),
        members: {
            label: 'Members',
            icon: UsersIcon,
            href: `${base}/members`,
            create: `${base}/members/--create`,
        },
        users: {
            label: 'Users',
            href: `${base}/users`
        },
    } as const
}



export const tools = {
    competencyRecorder: {
        href: `/tools/competency-recorder`,
        label: 'Competency Recorder',

        single: {
            label: 'Single Check',
            href: `/tools/competency-recorder/single`
        },
        session: (sessionId: string) => {
            const sessionBase = `/tools/competency-recorder/sessions/${sessionId}`
            return {
                href: sessionBase,
                assessees: {
                    label: 'Assessees',
                    href: `${sessionBase}/assessees`,
                },
                assessors: {
                    label: 'Assessors',
                    href: `${sessionBase}/assessors`,
                },
                recordIndividual: {
                    label: 'Individual',
                    href: `${sessionBase}/record-individual`,
                },
                skills: {
                    label: 'Skills',
                    href: `${sessionBase}/skills`,
                },
                transcript: {
                    label: 'Transcript',
                    href: `${sessionBase}/transcript`,
                },
            } as const
        },
        sessions: {
            label: 'Sessions',
            href: '/tools/competency-recorder/sessions',
        },
    }

} as const

export const d4h = {
    label: 'D4H Integration',
    icon: CableIcon,
    href: '/d4h',
    activities: {
        label: 'Activities',
        href: '/d4h/activities',
        bgColor: 'bg-teal-400'
    },
    calendar: {
        label: 'Calendar',
        href: '/d4h/calendar',
        bgColor: 'bg-yellow-400'
    },
    
    equipment: {
        label: 'Equipment',
        href: '/d4h/equipment',
        bgColor: 'bg-red-400'
    },
    personnel: {
        label: 'Personnel',
        href: '/d4h/personnel',
        bgColor: 'bg-blue-400'
    },
} as const

//  /------------------------------\
//  |           Account            |
//  \------------------------------/
export const personal = {
    label: 'Personal',
    index: '/personal',
    href: '/personal',

    organizationList: {
        label: 'Organizations',
        href: '/personal/organizations',
    },
    d4hAccessTokens: {
        label: 'D4H Access Tokens',
        href: '/personal/d4h-access-tokens',
    },
    settings: {
        label: "Personal Settings",
        href: '/personal/settings',
    },
    whoami: {
        label: 'Who Am I',
        href: '/personal/whoami',
    },
    account: {
        label: 'Account',
        href: '/personal/account',
    },
} as const


const docsBase = "https://github.com/redcloud-nz/rtplus/wiki"

export const documentation = {
    index: `${docsBase}`,
    glossary: `${docsBase}/glossary`,
    competencies: `${docsBase}/competencies`,
    competencyRecorder: {
        href: `${docsBase}/Competency-Recorder`,
    },
    personnel: `${docsBase}/personnel`,
    skills: `${docsBase}/skills`,
    skillGroups: `${docsBase}/skill-groups`,
    skillPackages: `${docsBase}/skill-packages`,
    teams: `${docsBase}/teams`,
    unified: `${docsBase}/unified`,
    account: `${docsBase}/account`,
}