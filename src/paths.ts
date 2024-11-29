
//  /------------------------------\
//  |         Competencies         |
//  \------------------------------/
export const competencies = '/competencies'

export const competencyAssessments = `${competencies}/assessments`
export const competencyAssessment = (assessmentId: string) => `${competencyAssessments}/${assessmentId}`

export const competencyAssessmentEdit = (assessmentId: string) => `${competencyAssessment(assessmentId)}/edit`
export const competencyAssessmentSkills = (assessmentId: string) => `${competencyAssessment(assessmentId)}/skills`
export const competencyAssessmentPersonnel = (assessmentId: string) => `${competencyAssessment(assessmentId)}/personnel`
export const competencyAssessmentAssess = (assessmentId: string) => `${competencyAssessment(assessmentId)}/assess`


//  /------------------------------\
//  |        Configuration         |
//  \------------------------------/
export const manage = '/manage'

// Capabilities
export const capabilities = `${manage}/capabilities`
export const newCapability = `${capabilities}/new`
export const capability = (capabilityId: string) => `${capabilities}/${capabilityId}`
export const editCapability = (capabilityId: string) => `${capability(capabilityId)}/edit`

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


//  /------------------------------\
//  |           Profile            |
//  \------------------------------/
export const profile = '/profile'

// D4H Access Keys
export const d4hAccessKeys = `${profile}/d4h-access-keys`

// Whoami
export const whoami = `${profile}/whoami`