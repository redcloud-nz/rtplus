/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

//  /------------------------------\
//  |         Competencies         |
//  \------------------------------/
export const competencies = {
    dashboard: '/competencies',
    sessionList: '/competencies/sessions',
    session: (aId: string) => ({
        info: `/competencies/sessions/${aId}`,
        edit: `/competencies/sessions/${aId}/edit`,
        skills: `/competencies/sessions/${aId}/skills`,
        personnel: `/competencies/sessions/${aId}/personnel`,
        assess: `/competencies/sessions/${aId}/assess`,
    } as const),
    newSession: '/competencies/sessions/new-session',
    reportsList: `/competencies/reports`,
    reports: {
        individual: `/competencies/reports/individual`,
        teamSkills: `/competencies/reports/teamSkills`,
        teamMembers: `/competencies/reports/teamMembers`,
    }
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
export const skillsAll = `${manage}/skills`
export const newSkill = `${manage}/skills/new`
export const skill = (sId: string) => `${manage}/skills/${sId}`
export const editSkill = (sId: string) => `${skill(sId)}/edit`

// Skill Groups
export const skillGroupsAll = `${manage}/skill-groups`
export const newSkillGroup = `${skillGroupsAll}/new`
export const skillGroup = (sgId: string) => `${manage}/skill-groups/${sgId}`
export const editSkillGroup = (sgId: string) => `${skillGroup(sgId)}/edit`

// Skill Packages
export const skillPackages = `${manage}/skill-packages`
export const newSkillPackage = `${skillPackages}/new`
export const skillPackage = (pId: string) => `${skillPackages}/${pId}`
export const editSkillPackage = (pId: string) => `${skillPackage(pId)}/edit`

// Teams
export const teams =  `${manage}/teams`
export const newTeam = `${teams}/new`
export const team = (tId: string) => `${teams}/${tId}`
export const editTeam = (tId: string) => `${team(tId)}/edit`
export const teamMembers = (tId: string) => `${team(tId)}/members`


//  /------------------------------\
//  |           Account            |
//  \------------------------------/
export const account = {
    profile: '/account/user-profile',
    organizationList: '/account/organization-list',
    d4hAccessKeys: '/account/d4h-access-keys',
    whoami: '/account/whoami'
} as const