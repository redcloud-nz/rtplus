/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { BookOpenIcon, CableIcon, CheckCheckIcon, CheckIcon, PocketKnifeIcon, ShieldHalfIcon, UsersIcon } from 'lucide-react'

import { TeamData } from '@/lib/schemas/team'
import { PersonRef } from './lib/schemas/person'
import { SkillCheckSessionData } from './lib/schemas/skill-check-session'

const SkillsIcon = PocketKnifeIcon

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
        create: {
            label: "Create",
            href: '/system/teams/--create',
        },
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
        create: {
            label: "Create",
            href: '/system/personnel/--create'
        },

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
                create: {
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
                    href: `${packageBase}/skills/--create`
                },
            },
        } as const
    }, 
    skillPackages: {
        label: 'Skill Packages',
        href: '/system/skill-packages',
        icon: SkillsIcon,
        create: {
            href: '/system/skill-packages/--create'
        },
        import: {
            label: 'Import Skill Package',
            href: '/system/skill-packages/--import',
        }
    } as const,
}



export const team = (teamOrSlug: TeamData | string) => {
    const teamSlug = typeof teamOrSlug === 'string' ? teamOrSlug : teamOrSlug.slug
    const base = `/teams/${teamSlug}` as const
    const skillsBase = `${base}/skills` as const

    return {
        href: base,
        label: typeof teamOrSlug === 'string' ? undefined as never : (teamOrSlug.shortName || teamOrSlug.name),
        accept: `${base}/accept`,
        availability: `${base}/availability`,
        checklists: `${base}/checklists`,
        dashboard: {
            label: 'Dashboard',
            href: `${base}/dashboard`
        },
        invitations: {
            label: 'Invitations',
            href: `${base}/invitations`
        },
        member: (personOrPersonId: PersonRef | string) => {
            const personId = typeof personOrPersonId === 'string' ? personOrPersonId : personOrPersonId.personId

            return {
            href: `${base}/members/${personId}`,
            label: typeof personOrPersonId === 'string' ? undefined as never: personOrPersonId.name,
            skills: {
                label: 'Skills',
                href: `${base}/members/${personId}/skills`,
                icon: SkillsIcon,
                bgColor: 'bg-sky-500'
            },
        } as const
        },
        members: {
            label: 'Members',
            icon: UsersIcon,
            href: `${base}/members`,
            create: {
                label: 'Create',
                href: `${base}/members/--create`,
            },
        },
        note: (noteId: string) => ({
            href: `${base}/notes/${noteId}`,
            label: `Note ${noteId}`,
        }),
        notes: {
            label: 'Notes',
            href: `${base}/notes`,
            create: {
                label: 'Create',
                href: `${base}/notes/--create`,
            },
        },
        skills: {
            label: 'Skills',
            href: skillsBase,
            icon: SkillsIcon,
            checks: {
                label: 'Checks',
                href: `${skillsBase}/checks`,
                create: {
                    label: 'Record Check',
                    href: `${skillsBase}/checks/--create`
                },
            },
            record: `${skillsBase}/record`,
            reports: {
                label: 'Reports',
                href: `${skillsBase}/reports`,
                individual: {
                    href: `${skillsBase}/reports/individual`,
                    label: 'Individual',
                },
                teamSkills: {
                    href: `${skillsBase}/reports/team-skills`,
                    label: 'Team Skills',
                },
                teamMembers: {
                    href: `${skillsBase}/reports/team-members`,
                    label: 'Team Members',
                },
            },
            session: (sessionId: string) => ({
                href: `${skillsBase}/sessions/${sessionId}`
            } as const),
             catalogue: {
                label: 'Catalogue',
                href: `${skillsBase}/catalogue`,
            },
            sessions: {
                label: 'Sessions',
                href: `${skillsBase}/sessions`,
                create: {
                    label: 'Create',
                    href: `${skillsBase}/sessions/--create`,
                },
            },
        },
        users: {
            label: 'Users',
            href: `${base}/users`
        },
    } as const
}



export const tools = {
    skillRecorder: {
        href: `/tools/skill-recorder`,
        label: 'Skill Recorder',

        single: {
            label: 'Single',
            href: `/tools/skill-recorder/single`,
            icon: CheckIcon
        },
        session: (sessionOrSessionId: string | SkillCheckSessionData) => {
            const sessionId = typeof sessionOrSessionId === 'string' ? sessionOrSessionId : sessionOrSessionId.sessionId
            const sessionBase = `/tools/skill-recorder/sessions/${sessionId}`
            return {
                label: typeof sessionOrSessionId === 'string' ? 'Session' : sessionOrSessionId.name,
                href: sessionBase,
                assessees: {
                    label: 'Assessees',
                    href: `${sessionBase}/assessees`,
                },
                assessors: {
                    label: 'Assessors',
                    href: `${sessionBase}/assessors`,
                },
                recordByAssessee: {
                    label: 'By Assessee',
                    href: `${sessionBase}/record-by-assessee`,
                },
                recordBySkill: {
                    label: 'By Skill',
                    href: `${sessionBase}/record-by-skill`,
                },
                recordSingle: {
                    label: 'Single',
                    href: `${sessionBase}/record-single`,
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
            href: '/tools/skill-recorder/sessions',
            icon: CheckCheckIcon
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
        label: 'Account',
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
        icon: BookOpenIcon
    },
    personnel: `${docsBase}/personnel`,
    skills: `${docsBase}/skills`,
    skillGroups: `${docsBase}/skill-groups`,
    skillPackages: `${docsBase}/skill-packages`,
    teams: `${docsBase}/teams`,
    unified: `${docsBase}/unified`,
    account: `${docsBase}/account`,
}