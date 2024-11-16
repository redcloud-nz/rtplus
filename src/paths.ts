


export namespace Paths {

    // Capabilities
    export const capabilities = `/manage/capabilities`
    export const newCapability = `${capabilities}/new`
    export const capability = (capabilityId: string) => `${capabilities}/${capabilityId}`
    export const editCapability = (capabilityId: string) => `${capability(capabilityId)}/edit`

    // Manage
    export const manage = '/manage'

    // People
    export const people = `${manage}/people`
    export const newPerson = `${people}/new`
    export const person = (personId: string) => `${people}/${personId}`
    export const editPerson = (personId: string) => `${person(personId)}/edit`
    export const personMemberships = (personId: string) => `${person(personId)}/memberships`

    // Skills
    export const skills = `${manage}/skills`
    export const newSkill = `${skills}/new`
    export const skill = (skillId: string) => `${skills}/${skillId}`
    export const editSkill = (skillId: string) => `${skill(skillId)}/edit`

    // Skill Groups
    export const skillGroups = `${manage}/skill-groups`
    export const newSkillGroup = `${skillGroups}/new`
    export const skillGroup = (skillGroupId: string) => `${skillGroup}/${skillGroupId}`
    export const editSkillGroup = (skillGroupId: string) => `${skillGroup(skillGroupId)}/edit`

    // Teams
    export const teams =  `${manage}/teams`
    export const newTeam = `${teams}/new`
    export const team = (teamIdOrCode: string) => `${teams}/${teamIdOrCode}`
    export const editTeam = (teamIdOrCode: string) => `${team(teamIdOrCode)}/edit`
    export const teamMembers = (teamIdOrCode: string) => `${team(teamIdOrCode)}/members`

}
