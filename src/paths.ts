/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export const availability = {
    index: '/availability',
} as const

export const checklists = {
    index: '/checklists',
} as const

//  /------------------------------\
//  |         Competencies         |
//  \------------------------------/
export const competencies = {
    configuration: '/competencies/configuration',
    dashboard: '/competencies',
    sessionList: '/competencies/sessions',
    session: (sId: string) => `/competencies/sessions/${sId}`,
    newSession: '/competencies/sessions/new-session',
    record: '/competencies/record',
    reportsList: `/competencies/reports`,
    reports: {
        individual: `/competencies/reports/individual`,
        teamSkills: `/competencies/reports/teamSkills`,
        teamMembers: `/competencies/reports/teamMembers`,
    },
} as const

//  /------------------------------\
//  |        Configuration         |
//  \------------------------------/
export const manage = '/manage'

export const imports = {
    list: '/manage/imports',
    personnel: '/manage/imports/personnel',
    skillPackage: '/manage/imports/skill-package',
} as const

// Personnel
export const personnel = `${manage}/personnel`
export const newPerson = `${personnel}/new`
export const person = (pId: string) => `${personnel}/${pId}`
export const editPerson = (pId: string) => `${person(pId)}/edit`
export const personAccess = (pId: string) => `${person(pId)}/access`
export const personMemberships = (pId: string) => `${person(pId)}/memberships`

// Skills
export const skillsList = `${manage}/skills`
export const newSkill = `${manage}/skills/new`
export const skill = (sId: string) => `${manage}/skills/${sId}`
export const editSkill = (sId: string) => `${skill(sId)}/edit`

// Skill Groups
export const skillGroupsList = `${manage}/skill-groups`
export const newSkillGroup = `${skillGroupsList}/new`
export const skillGroup = (sgId: string) => `${manage}/skill-groups/${sgId}`
export const editSkillGroup = (sgId: string) => `${skillGroup(sgId)}/edit`

// Skill Packages
export const skillPackagesList = `${manage}/skill-packages`
export const newSkillPackage = `${skillPackagesList}/new`
export const skillPackage = (pId: string) => `${skillPackagesList}/${pId}`
export const editSkillPackage = (pId: string) => `${skillPackage(pId)}/edit`

// Teams

const teamsPrefix = `${manage}/teams`
export const teams = {
    list: teamsPrefix,
    new: `${teamsPrefix}/new`,
    team: (tId: string) => ({
        index: `${teamsPrefix}/${tId}`,
        edit: `${teamsPrefix}/${tId}/edit`,
        members: `${teamsPrefix}/${tId}/members`,
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
    profile: '/account/user-profile',
    organizationList: '/account/organization-list',
    d4hAccessKeys: '/account/d4h-access-keys',
    whoami: '/account/whoami'
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