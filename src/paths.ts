/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

//  /------------------------------\
//  |        Configuration         |
//  \------------------------------/
export const system = '/system'

export const imports = {
    list: '/manage/imports',
    personnel: '/manage/imports/personnel',
    skillPackage: '/manage/imports/skill-package',
} as const

// Personnel
export const personnel = `${system}/personnel`
export const newPerson = `${personnel}/new`
export const person = (pId: string) => `${personnel}/${pId}`
export const editPerson = (pId: string) => `${person(pId)}/edit`
export const personAccess = (pId: string) => `${person(pId)}/access`
export const personMemberships = (pId: string) => `${person(pId)}/memberships`

// Skills
export const skillsList = `${system}/skills`
export const newSkill = `${system}/skills/new`
export const skill = (sId: string) => `${system}/skills/${sId}`
export const editSkill = (sId: string) => `${skill(sId)}/edit`

// Skill Groups
export const skillGroupsList = `${system}/skill-groups`
export const newSkillGroup = `${skillGroupsList}/new`
export const skillGroup = (sgId: string) => `${system}/skill-groups/${sgId}`
export const editSkillGroup = (sgId: string) => `${skillGroup(sgId)}/edit`

// Skill Packages
export const skillPackagesList = `${system}/skill-packages`
export const newSkillPackage = `${skillPackagesList}/new`
export const skillPackage = (pId: string) => `${skillPackagesList}/${pId}`
export const editSkillPackage = (pId: string) => `${skillPackage(pId)}/edit`

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

const teamsPrefix = `${system}/teams`
export const teams = {
    list: teamsPrefix,
    new: `${teamsPrefix}/new`,
    team: (teamId: string) => ({
        index: `${teamsPrefix}/${teamId}`,
        edit: `${teamsPrefix}/${teamId}/edit`,
        members: `${teamsPrefix}/${teamId}/members`,
    } as const),
} as const

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