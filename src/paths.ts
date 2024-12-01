
//  /------------------------------\
//  |         Competencies         |
//  \------------------------------/
export const competencies = '/competencies'

export const competencyAssessments = `${competencies}/assessments`
export const competencyAssessment = (aId: string) => `${competencyAssessments}/${aId}`

export const competencyAssessmentEdit = (aId: string) => `${competencyAssessment(aId)}/edit`
export const competencyAssessmentSkills = (aId: string) => `${competencyAssessment(aId)}/skills`
export const competencyAssessmentPersonnel = (aId: string) => `${competencyAssessment(aId)}/personnel`
export const competencyAssessmentAssess = (aId: string) => `${competencyAssessment(aId)}/assess`


//  /------------------------------\
//  |        Configuration         |
//  \------------------------------/
export const manage = '/manage'

// Capabilities
export const capabilities = `${manage}/capabilities`
export const newCapability = `${capabilities}/new`
export const capability = (cId: string) => `${capabilities}/${cId}`
export const editCapability = (cId: string) => `${capability(cId)}/edit`

// People
export const personnel = `${manage}/personnel`
export const newPerson = `${personnel}/new`
export const person = (pId: string) => `${personnel}/${pId}`
export const editPerson = (pId: string) => `${person(pId)}/edit`
export const personMemberships = (pId: string) => `${person(pId)}/memberships`

// Skills
export const skillsAll = `${manage}/skills`
export const newSkill = `${manage}/skills/new`
export const skill = (sId: string) => `${manage}/skills/${sId}`
export const editSkill = (sId: string) => `${skill(sId)}/edit`

// Skill Groups
export const skillGroupsAll = `${manage}/skill-groups`
export const newSkillGroup = `${skillGroupsAll}/new`
export const skillGroup = (sgId: string) => `${manage}/skill-groups/${sgId}/`
export const editSkillGroup = (sgId: string) => `${skillGroup(sgId)}/edit`

// Teams
export const teams =  `${manage}/teams`
export const newTeam = `${teams}/new`
export const team = (tId: string) => `${teams}/${tId}`
export const editTeam = (tId: string) => `${team(tId)}/edit`
export const teamMembers = (tId: string) => `${team(tId)}/members`


//  /------------------------------\
//  |           Profile            |
//  \------------------------------/
export const profile = '/profile'

// D4H Access Keys
export const d4hAccessKeys = `${profile}/d4h-access-keys`

// Whoami
export const whoami = `${profile}/whoami`