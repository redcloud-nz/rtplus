/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

//  /------------------------------\
//  |        Configuration         |
//  \------------------------------/
export const config = {
    index: '/config',
    teams: {
        index: '/config/teams',
        new: '/config/teams/new',
        team: (teamSlug: string) => ({
            index: `/config/teams/${teamSlug}`,
            edit: `/config/teams/${teamSlug}/edit`,
            members: `/config/teams/${teamSlug}/members`,
        } as const),
    },
    personnel: {
        index: '/config/personnel',
        new: '/config/personnel/new',
        person: (personId: string) => ({
            index: `/config/personnel/${personId}`,
            edit: `/config/personnel/${personId}/edit`,
            access: `/config/personnel/${personId}/access`,
            memberships: `/config/personnel/${personId}/memberships`,
        } as const),
    },
    skills: {
        index: '/config/skills',
        new: '/config/skills/new',
        skill: (skillId: string) => ({
            index: `/config/skills/${skillId}`,
            edit: `/config/skills/${skillId}/edit`,
        } as const),
    },
    skillGroups: {
        index: '/config/skill-groups',
        new: '/config/skill-groups/new',
        skillGroup: (skillGroupId: string) => ({
            index: `/config/skill-groups/${skillGroupId}`,
            edit: `/config/skill-groups/${skillGroupId}/edit`,
        } as const),
    },
    skillPackages: {
        index: '/config/skill-packages',
        new: '/config/skill-packages/new',
        skillPackage: (skillPackageId: string) => ({
            index: `/config/skill-packages/${skillPackageId}`,
            edit: `/config/skill-packages/${skillPackageId}/edit`,
        } as const),
    },
}

export const imports = {
    list: '/config/imports',
    personnel: '/config/imports/personnel',
    skillPackage: '/config/imports/skill-package',
} as const

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
            dashboard: competenciesBase,
            sessionList: `${competenciesBase}/sessions`,
            session: (sessionId: string) => `${competenciesBase}/sessions/${sessionId}`,
            newSession: `${competenciesBase}/sessions/new`,
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
export const account = {
    profile: '/me/user-profile',
    organizationList: '/me/organization-list',
    d4hAccessKeys: '/me/d4h-access-keys',
    whoami: '/me/whoami'
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