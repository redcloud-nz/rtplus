/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { type SkillCheckSessionId } from './lib/schemas/skill-check-session'

export const marketing = {

    index: { href: '/' },
    contact: {
        label: 'Contact',
        href: '/contact',
    },
    faq: {
        label: 'FAQ',
        href: '/#faq',
    },
    features: {
        label: 'Features',
        href: '/#features',
    },
    pricing: {
        label: 'Pricing',
        href: '/#pricing',
    },
    privacyPolicy: {
        label: 'Privacy Policy',
        href: '/privacy-policy',
    },
    termsOfService: {
        label: 'Terms of Service',
        href: '/terms-of-service',
    },
    testimonials: {
        label: 'Testimonials',
        href: '/#testimonials',
    },
}

export const about = {
    label: 'About',
    href: '/about',
} as const

export const admin = {

    label: 'Admin',
    href: '/admin',

    person: (personId: string) => {
        const personBase = `/admin/personnel/${personId}` as const
        return {
            href: personBase,

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
        href: '/admin/personnel',
        create: {
            label: "Create",
            href: '/admin/personnel/--create'
        },

        import: {
            label: 'Import Personnel',
            href: '/admin/personnel/--import',
        }
    } as const,
    settings: {
        label: 'Settings',
        href: '/admin/settings',
    },
    skillPackage: (skillPackageId: string) => {
        const packageBase = `/admin/skill-packages/${skillPackageId}` as const

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
                create: {
                    label: 'Create',
                    href: `${packageBase}/groups/--create`
                },
            },

            skill: (skillId: string) => ({
                href: `${packageBase}/skills/${skillId}`,
                update: `${packageBase}/skills/${skillId}/--update`,
                delete: `${packageBase}/skills/${skillId}/--delete`,
            } as const),

            skills: {
                label: 'Skills',
                create: {
                    label: 'Create',
                    href: `${packageBase}/skills/--create`
                },
            },
        } as const
    },
    skillPackages: {
        label: 'Skill Packages',
        href: '/admin/skill-packages',
        create: {
            label: 'Create',
            href: '/admin/skill-packages/--create'
        },
        import: {
            label: 'Import Skill Package',
            href: '/admin/skill-packages/--import',
        }
    } as const,
    team: (teamId: string) => {
        const teamBase = `/admin/teams/${teamId}` as const
        return {
            href: teamBase,

            member: (personId: string) => ({
                href: `${teamBase}/members/${personId}`,
            } as const),
            members: {
                label: 'Members',
                href: `${teamBase}/members`,
            }
        } as const
    },
    teams: {
        label: 'Teams',
        href: '/admin/teams',

        create: {
            label: "Create",
            href: '/admin/teams/--create',
        }
    }
} as const

export const createTeam = {
    label: 'Create Team',
    href: '/create-team',
} as const

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

    flags: {
        label: 'Flags',
        href: '/system/flags',
    },

    
}

export const skills = {
    label: 'Skills',
    href: '/skills',

    catalogue: {
        label: 'Catalogue',
        href: `/skills/catalogue`,
    },

    checks: {
        label: 'Checks',
        href: `/skills/checks`,
        create: {
            label: 'Record Check',
            href: `/skills/checks/--create`
        },
    },
    reports: {
        label: 'Reports',
        href: `/skills/reports`,
        individual: {
            href: `/skills/reports/individual`,
            label: 'Individual',
        },
        teamSkills: {
            href: `/skills/reports/team-skills`,
            label: 'Team Skills',
        },
        teamMembers: {
            href: `/skills/reports/team-members`,
            label: 'Team Members',
        },
    },
    session: (sessionId: SkillCheckSessionId) => {
        return {
            href: `/skills/sessions/${sessionId}`,

            record: {
                href: `/skills/sessions/${sessionId}/record`,
            },
            review: {
                href: `/skills/sessions/${sessionId}/review`,
                label: 'Review',
            }
        } as const
    },
    sessions: {
        label: 'Sessions',
        href: `/skills/sessions`,
        create: {
            label: 'Create',
            href: `/skills/sessions/--create`,
        },
    },
} as const


export const d4h = {
    label: 'D4H Integration',
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

    note: (noteId: string) => ({
        label: `Note ${noteId}`,
        href: `/personal/notes/${noteId}`,
    } as const),
    notes: {
        label: 'Notes',
        href: '/personal/notes',

        create: {
            label: 'Create',
            href: '/personal/notes/--create',
        },
    },
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
        label: 'Manage Account',
        href: '/personal/account',
    },
} as const


const docsBase = "https://github.com/redcloud-nz/rtplus/wiki"

export const documentation = {
    index: `${docsBase}`,
    glossary: `${docsBase}/glossary`,
    competencies: {
        label: 'Documentation',
        href: `${docsBase}/Competencies`,
    },
    personnel: `${docsBase}/personnel`,
    skills: `${docsBase}/skills`,
    skillGroups: `${docsBase}/skill-groups`,
    skillPackages: `${docsBase}/skill-packages`,
    teams: `${docsBase}/teams`,
    unified: `${docsBase}/unified`,
    account: `${docsBase}/account`,
}