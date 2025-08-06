/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { IDValidationSet } from '@/lib/id'

export interface SkillPackageDef {
    id: string
    name: string
    sequence: number
    skillGroups: SkillGroupDef[]
}

export interface SkillGroupDef {
    id: string
    name: string
    skillPackageId: string
    parentId: string | null
    sequence: number
    subGroups: SkillGroupDef[]
    skills: SkillDef[]
}

export interface SkillDef {
    id: string
    name: string
    skillPackageId: string
    skillGroupId: string
    optional: boolean
    frequency: string
    description: string
    sequence: number
}

const PLACEHOLDER = 'PLACEHOLDER' as const

const vSet = new IDValidationSet()

type SkillPackageArgs = Omit<SkillPackageDef, | 'skillGroups'> & Partial<Pick<SkillPackageDef, 'skillGroups'>>

function definePackage({ id: skillPackageId, ...pkg }: SkillPackageArgs): SkillPackageDef {
    function patchSkill(skill: SkillDef, skillGroupId: string, sequence: number): SkillDef {
        return { ...skill, skillPackageId, skillGroupId, sequence }
    }
    function patchSkillGroup(skillGroup: SkillGroupDef, parentId: string | null, sequence: number): SkillGroupDef {
        return { 
            ...skillGroup, 
            skillPackageId, 
            parentId,
            sequence,
            subGroups: skillGroup.subGroups.map((subGroup, subGroupIndex) => patchSkillGroup(subGroup, skillGroup.id, subGroupIndex+1)),
            skills: skillGroup.skills.map((skill, skillIndex) => patchSkill(skill, skillGroup.id, skillIndex+1)), 
        }
    }

    vSet.validate(skillPackageId)

    return { 
        ...pkg,
        id: skillPackageId,
        skillGroups: (pkg.skillGroups ?? []).map((skillGroup, groupIndex) => patchSkillGroup(skillGroup, null, groupIndex+1)),
    }
}

type SkillGroupArgs = Omit<SkillGroupDef, 'skillPackageId' | 'parentId' | 'sequence' | 'subGroups'> & Partial<Pick<SkillGroupDef, 'subGroups'>>

function defineGroup({id, skills, subGroups = [], ...data }: SkillGroupArgs): SkillGroupDef {
    vSet.validate(id)

    return { id, skillPackageId: PLACEHOLDER, parentId: PLACEHOLDER, sequence: -1, skills, subGroups, ...data }
}

interface SkillArgs {
    id: string
    name: string
    optional?: boolean
    frequency?: string
    description?: string
}

function defineSkill({ id, name, optional = false, frequency = 'P1Y', description = "" }: SkillArgs): SkillDef {
    vSet.validate(id)

    return { id, name, skillPackageId: PLACEHOLDER, skillGroupId: PLACEHOLDER, optional, frequency, description, sequence: -1 }
}

export const PackageList: SkillPackageDef[] = [
    definePackage({ 
        id: "5UjUAtIM", 
        name: "Foundation", 
        sequence: 1,
        skillGroups: [
            defineGroup({ 
                id: "paScPTf8", 
                name: "First Aid",
                skills: [
                    defineSkill({ id: "QApthAIq", name: "First Aid Certificate", description: "Hold a current first aid certificate." }),
                    defineSkill({ id: "LfCGLXmR", name: "Patient Report Form", description: "Can complete a patient report form with basic observations." }),
                    defineSkill({ id: "3eNRKXQF", name: "Package patient", description: "Can package a patient into a stretcher as a team member." }),
                    defineSkill({ id: "VWaSOiF8", name: "Apply First Aid", description: "Can apply first aid techniques to patient in a scenario." })
                ]
            }),
            defineGroup({ 
                id: "jNs8IGSU", 
                name: "Soft Skills", 
                skills: [
                    defineSkill({ id: "tDQ2M8do", name: "Cultural Awareness", description: "Demonstrate cultural awareness.", frequency: 'P2Y' }),
                    defineSkill({ id: "ZfC6cMid", name: "Psychological First Aid", description: "Demonstrate use of psychological first aid.", frequency: 'P2Y' })
                ]
            }),
            defineGroup({ 
                id: "6Xs8pOeC", 
                name: "Other",
                skills: [
                    defineSkill({ id: "LiHqycpC", name: "Staff a cordon", description: "Staff a cordon with appropriate PPE and make correct decisions about access." }),
                    defineSkill({ id: "pH0YJi1J", name: "Conduct reconnaissance", description: "Conduct reconnaissance and pass on relevant information effectively."}),
                    defineSkill({ id: "9HdeULpE", name: "Deployment Process", description: "Demonstrate familiarity with the deployment process.", frequency: 'P2Y' }),
                    defineSkill({ id: "B0s7tqqS", name: "Generator", description: "Operate and maintain a generator." }),
                    defineSkill({ id: "WZfZrTtX", name: "Emergency Lighting System", description: "Operate and maintain an Emergency lighting system." }),
                    defineSkill({ id: "ViHs6pM0", name: "Handheld Radios", description: "Operate and maintain handheld radios." }),
                    defineSkill({ id: "T3ut0osO", name: "Assist with ICP", description: "Assist with establishing team ICP facilities." }),
                    defineSkill({ id: "mXQ2ICV1", name: "Physical Assessment", description: "Fitness test/Physical assessment per NZRT Guidelines." })
                ]}
            ),
            defineGroup({ 
                id: "nwVvwKwX", 
                name: "Communications",
                skills: [
                    defineSkill({ id: "tWrF9L0w", name: "Comms Center", description: "Operate and manage a communications centre or hub." }),
                    defineSkill({ id: "2xQzEa4G", name: "Portable Repeater", description: "Set up a portable repeater or Cross Band.", frequency: 'P2Y' }),
                    defineSkill({ id: "0I9Vl0Uy", name: "BGAN or Starlink", description: "Set up BGAN or Starlink alternative comms system.", frequency: 'P2Y' }),
                    defineSkill({ id: "Bv0AOevB", name: "Info Management", description: "Familiarity with team information management systems." })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "oB5l5D8U", 
        name: "Light Rescue", 
        sequence: 2,
        skillGroups: [
            defineGroup({ 
                id: "DxAar9TH", 
                name: "Knots and Lines",
                skills: [
                    defineSkill({ id: "3E2opDUi", name: "Single Figure 8", description: "Tie a single figure 8 knot." }),
                    defineSkill({ id: "PK5Iz6wk", name: "Figure 8 on the Bight", description: "Tie a figure 8 on the bight." }),
                    defineSkill({ id: "SSiG9YT6", name: "Rethreaded Figure 8", description: "Tie a rethreaded figure 8." }),
                    defineSkill({ id: "pFWbcfVf", name: "Joining 8", description: "Join two ropes with a joining 8 (figure 8 bend)." }),
                    defineSkill({ id: "k27h1Zpv", name: "Round Turn and 2 half hitches", description: "Tie a round turn and 2 half hitches" }),
                    defineSkill({ id: "iZaTUGga", name: "Alpine Butterfly", description: "Tie an alpine butterfly knot." }),
                    defineSkill({ id: "zJPXkXHS", name: "Prussik Knot", description: "Tie a classic prussik knot." }),
                    defineSkill({ id: "ZZV0Kew9", name: "Munter Hitch", description: "Tie a munter hitch (italian hitch)." }),
                    defineSkill({ id: "Ph2aQsdn", name: "Clove Hitch", description: "Tie a clove hitch." }),
                    defineSkill({ id: "DD4rmGHh", name: "Inspect Rope", description: "Inspect a rope and complete a rope log." }),
                    defineSkill({ id: "e8wp1c3d", name: "Industrial 8", description: "Tie and industrial 8 (2 loop figure 8).", optional: true }),
                    defineSkill({ id: "Z66lMqEs", name: "Tape Knot", description: "Tie a tape knot (water knot).", optional: true }),
                    defineSkill({ id: "f7zBn1ZO", name: "Double Fishermans", description: "Join two ropes with a double fishers bend.", optional: true }),
                    defineSkill({ id: "1gqtuYbk", name: "Vertical Lift Knot", description: "Tie a vertical lift knot or improvised harness on another person.", optional: true })
                ]}
            ),
            defineGroup({ 
                id: "tCErpzSZ", 
                name: "Search Techniques", 
                skills: [
                    defineSkill({ id: "fHf2Y6m9", name: "Correct PPE", description: "Wear correct PPE and complete a buddy check." }),
                    defineSkill({ id: "iHoR3DuF", name: "Rubble Crawl", description: "Rubble pile crawl with 3-points of contact." }),
                    defineSkill({ id: "FWLhDc8b", name: "Line and Hail", description: "Participate in a line and hail search." }),
                    defineSkill({ id: "65Dx23p0", name: "Site Recon", description: "Complet a reconaissance and hazard assessment of the site." }),
                    defineSkill({ id: "utQYT2cr", name: "Victim Marking", description: "Complete an INSARAG victim marking." }),
                    defineSkill({ id: "Cr8elTWJ", name: "Site Map", description: "Map a site using USAR sides and quadrants." }),
                    defineSkill({ id: "jgwOAb81", name: "Occupant Interview", description: "Conduct an occupant or bystander interview." })
                ]}
            ),
            defineGroup({ 
                id: "htesLAjx", 
                name: "Ladders", 
                skills: [
                    defineSkill({ id: "UhQjUBEu", name: "Extension Ladder", description: "Raise and lower an extension ladder." }),
                    defineSkill({ id: "wJADOBSf", name: "Secure Ladder", description: "Secure head and foot of ladder." }),
                    defineSkill({ id: "iqAtsavX", name: "Climb Ladder", description: "Climb a ladder with 3 points of contact, holding rungs." }),
                    defineSkill({ id: "SdQGgEN0", name: "Mount/Dismount Ladder", description: "Correctly mount and dismount ladder at top." }),
                    defineSkill({ id: "bCY9iXvk", name: "Inspect Ladder", description: "Inspect ladder before and after use." })
                ]}
            ),
            defineGroup({ 
                id: "xm3QkP8s", 
                name: "Stretchers", 
                skills: [
                    defineSkill({ id: "uIZVoIsX", name: "Load Stretcher", description: "Load and blanket stretcher with patient secured correctly." }),
                    defineSkill({ id: "MG0mWYle", name: "Lash Stretcher", description: "Lash a patient in to basket stretcher." }),
                    defineSkill({ id: "t2LKmYPd", name: "Lowering Lines", description: "Attach lowering/tag lines to stretcher." }),
                    defineSkill({ id: "3t1xDver", name: "Stretcher Carry", description: "Carry a stretcher across level ground." }),
                    defineSkill({ id: "hpZbUWVh", name: "Stretcher Pass", description: "Stretcher pass over uneven ground." }),
                    defineSkill({ id: "Zy1ViqJp", name: "Stretcher Pass on Slope", description: "Stretcher pass over sloping grouns with safety line attached." }),
                    defineSkill({ id: "AznIXYnr", name: "Lash Board Stretcher", description: "Lash a patient to a board stretcher.", optional: true }),
                    defineSkill({ id: "T8owIghO", name: "Lash NATO Stretcher", description: "Last a patient to a NATO stretcher.", optional: true }),
                    defineSkill({ id: "qHyllpLo", name: "Improvised harness", description: "Secure a patient into stretcher with an improvised harness.", optional: true }),
                ]}
            ),
            defineGroup({ 
                id: "BSAmWUnH", 
                name: "ICP",
                skills: [
                    defineSkill({ id: "MMBDDFfs", name: "Sign in/out board", description: "Establish and maintain a sign in/out board or T-card system." })
                ]
            }),
            defineGroup({ 
                id: "nwcyjXkx", 
                name: "Lowers", 
                skills: [
                    defineSkill({ id: "rYfP2XhN", name: "Belay Anchors", description: "Establish top and/or bottom anchors for a lowering/belay system." }),
                    defineSkill({ id: "vTncvkHB", name: "Belay Stretcher", description: "Use a body belay or friction hitch to lower a stretcher." }),
                    defineSkill({ id: "jRCU4yH3", name: "2-Point Lower", description: "Conduct a 2-point lower." }),
                    defineSkill({ id: "pwhdy7Zy", name: "4-Point Lower", description: "Conduct a 4-point lower." }),
                    defineSkill({ id: "IxapEUKP", name: "Mechanical Belay", description: "Use a mechanical belay device to lower a stretcher.", optional: true }),
                    defineSkill({ id: "cxwIn6eI", name: "Ladder Slide", description: "Conduct a ladder slide.", optional: true }),
                    defineSkill({ id: "t88gsT3Y", name: "Ladder Hinge", description: "Conduct a ladder hinge.", optional: true }),
                    defineSkill({ id: "lcyX88FS", name: "3:2:1 Picket System", description: "Set up a 3:2:1 picket system.", optional: true }),
                    defineSkill({ id: "DZesx88e", name: "Single-Point Lower", description: "Conduct a single point lower", optional: true })
                ]
            }),
            defineGroup({ 
                id: "8BbKr0XS", 
                name: "Improvised Casualty Movement",
                skills: [
                    defineSkill({ id: "IEc5HIlT", name: "Blanket/Clothing Lift", description: "Lift a patient using either a blanket lift or clothing lift. " }),
                    defineSkill({ id: "o1stlUza", name: "Human Crutch", description: "Assist a patient across a room using a human crutch." }),
                    defineSkill({ id: "4968GJ1I", name: "2,3,4 Handed Seat", description: "Carry a patient using 2,3, and 4 handed seat." }),
                    defineSkill({ id: "e5153KtV", name: "Pack Strap Carry", description: "Carry a patient using a pack strap carry." }),
                    defineSkill({ id: "JXTPDEbv", name: "Fore and Aft Carry", description: "Carry a patient using a fore and aft carry." }),
                    defineSkill({ id: "rjdVeQXc", name: "Blanket/Clothing Drag", description: "Move a patient using a blanket drag or clothing drag." }),
                    defineSkill({ id: "OQFCPBRa", name: "Firemans Crawl", description: "Move a patient using a firemans crawl.", optional: true }),
                    defineSkill({ id: "L1Pu72vX", name: "Shoulder/Stair Carry", description: "Move a patient using a should/stair drag.", optional: true })
                ]
            })
        ]
    }),
    definePackage({
        id: "CvScf6pv", 
        name: "Flood Response", 
        sequence: 3,
        skillGroups: [
            defineGroup({
                id: "fUjitkGa",
                name: "Flood Protection",
                skills: [
                    defineSkill({ id: "gETPv0Z4", name: "Pumps", description: "Operate pumps (including priming and maintenance requirements)." }),
                    defineSkill({ id: "708HX7NY", name: "Sand Bagging", description: "Effective sand bagging as a team or alternate flood barrier systems." }),
                    defineSkill({ id: "y4Z6MSB0", name: "Divert Water", description: "Divert water for salvage." }),
                    defineSkill({ id: "vpeqJefW", name: "Ring Dyke", description: "Take part in forming a ring-3 dyke." }),
                    defineSkill({ id: "vFmc24gX", name: "Drain Hazards", description: "Identifies hazards when clearing drains." }),
                    defineSkill({ id: "fnAhB8A1", name: "Decontamination", description: "Conducts decontamination procedures", optional: true })
                ]
            }),
            defineGroup({
                id: "kyAIuLro",
                name: "Water Safety",
                skills: [
                    defineSkill({ id: "dDqXtURG", name: "Correct PPE", description: "Correct PPE work and buddy checked" }),
                    defineSkill({ id: "RiaPrZsk", name: "Priorities and Safety", description: "Understands or demonstrates priority of rescue (low to high risk) and reqs for upstream & downstream safety" }),
                    defineSkill({ id: "PTittis6", name: "Wading Poles", description: "Use wading poles/sticks to check surface for safety." }),
                    defineSkill({ id: "OknxYtTD", name: "River Crossing", description: "Demonstrate a river crossing technique as a team" }),
                    defineSkill({ id: "YyiBIvy8", name: "Swimming", description: "Swimming (aggressive and defensive) with correct ferry angle" }),
                    defineSkill({ id: "ut6lu0R7", name: "Throw Bags", description: "Throw bag accurately 10-15m" }),
                    defineSkill({ id: "Wn3u5RHn", name: "Swim to Eddy", description: "Able to swim to an eddy" }),
                    defineSkill({ id: "Ltqyz58Z", name: "Tension Diagonal", description: "Can rig a tension diagonal", optional: true }),
                    defineSkill({ id: "sCz334Ck", name: "Boat on Tether", description: "Can perform a boat on tether (4-point)" })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "vW8HWNb0", 
        name: "Storm Response", 
        sequence: 4,
        skillGroups: [
            defineGroup({
                id: "NWEGA1ou",
                name: "Storm",
                skills: [
                    defineSkill({ id: "g4izEP5Y", name: "Appropriate Anchors", description: "Choose appropriate anchors and rig correctly." }),
                    defineSkill({ id: "WFBK2zlb", name: "Setup Roof System", description: "Setup a roof access system." }),
                    defineSkill({ id: "B6MekYVc", name: "Use Roof System", description: "Use a roof access system (limiting fall factor)." }),
                    defineSkill({ id: "KiEo3ek6", name: "Roof Repairs", description: "Perform temorary roof repairs." }),
                    defineSkill({ id: "VVyUaKUB", name: "Rescue from roof", description: "Practice rescue from roof by lowering system." }),
                    defineSkill({ id: "ZUukVyWt", name: "Secure furniture", description: "Secure furniture/fittings, demonstrate salvage techniques." }),
                    defineSkill({ id: "xQEnbctv", name: "Window Cover", description: "Make a temporary window cover." }),
                    defineSkill({ id: "ckWZUKdn", name: "Inspect Equipment", description: "Inspect and log use of height equipment (ropes & hardware, etc)." }),
                ]
            }),
            defineGroup({
                id: "p0yK8Kyv",
                name: "Chainsaws",
                skills: [
                    defineSkill({ id: "Ou7pPg7Q", name: "Chainsaw PPE", description: "Wears correct PPE when using a chainsaw", optional: true }),
                    defineSkill({ id: "oUKXxILZ", name: "Chainsaw Handling", description: "Can demonstrate safe chainsaw handling, functional parts, and maintenance.", optional: true }),
                    defineSkill({ id: "r63ZIWCq", name: "Safe Fueling", description: "Can demonstrate safe fueling and oiling procedures", optional: true }),
                    defineSkill({ id: "ZctyP6Pz", name: "Start Procedures", description: "Can demonstrate correct cold and hot starting procedures.", optional: true }),
                    defineSkill({ id: "62aooLiV", name: "Saw Correctly", description: "Use the saw correctly and safely when cutting", optional: true }),
                    defineSkill({ id: "eSbiAjtv", name: "Area of Operation", description: "Has knowledge of areas of operation and escape routes", optional: true })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "14T0wSnu", 
        name: "CDC & Welfare", 
        sequence: 5,
        skillGroups: [
            defineGroup({
                id: "3TVQZx0b",
                name: "Civil Defence Centres and Welfare",
                skills: [
                    defineSkill({ id: "PJhGL4QI", name: "Establish CDC", description: "Establish/setup a CDC as part of a team." }),
                    defineSkill({ id: "zikPliwi", name: "Staff CDC", description: "Act as a CDC staff member" }),
                    defineSkill({ id: "NztQwm5p", name: "Needs Assessment", description: "Conduct a needs assessment." }),
                    defineSkill({ id: "wu1xM3SV", name: "Privacy", description: "Privacy measures are taken when conducting needs assessment." }),
                    defineSkill({ id: "0PgHYLBh", name: "Animal Welfare", description: "Understand animal welfare requirements at a CDC", optional: true }),
                ]
            })
        ]
    }),
    definePackage({ 
        id: "ydlzyyF", 
        name: "Swiftwater Rescue", 
        sequence: 6,
        skillGroups: [
            defineGroup({
                id: "vcNSd82R",
                name: "Responder",
                skills: []
            }),
            defineGroup({
                id: "d7gpd6k7",
                name: "Technician",
                skills: []
            }),
            defineGroup({
                id: "8UDRklM2",
                name: "Technician Advanced",
                skills: []
            }),
            defineGroup({
                id: "3ASEMJso",
                name: "Other",
                skills: []
            }),
            defineGroup({
                id: "619XPzxP",
                name: "Non-powered Craft",
                skills: []
            }),
            defineGroup({
                id: "PdmC6qe3",
                name: "Powered Craft",
                skills: []
            }),
            defineGroup({
                id: "crwp8m7N",
                name: "Rescue from Vehicle",
                skills: []
            })
        ]
    }),
    definePackage({ 
        id: "LnSfHuRJ", 
        name: "Rope Rescue", 
        sequence: 7,
        skillGroups: [
            defineGroup({
                id: "LKGNWwia",
                name: "Responder",
                skills: []
            }),
            defineGroup({
                id: "3gaX0e3q",
                name: "Technician",
                skills: []
            }),
            defineGroup({
                id: "TGMS2n6r",
                name: "Specialist",
                skills: []
            }),
        ]
    }),
    definePackage({ 
        id: "kPhxyIZe", 
        name: "Mass Casualty Support", 
        sequence: 8,
        skillGroups: [
            defineGroup({
                id: "wTgBHf6l",
                name: "Mass Casualty",
                skills: [
                    defineSkill({ id: "yZOoqLnI", name: "Establish CCP", description: "Help to establish a Casualty Collection Point (including seperate area for deceased)." }),
                    defineSkill({ id: "EPPWTohz", name: "Conduct Triage", description: "Conduct rapid traige using S.T.A.R.T. system." }),
                    defineSkill({ id: "yPGgw65Y", name: "Triage Tag", description: "Complete a victim triage tag." }),
                    defineSkill({ id: "DDjKZxAj", name: "Walking Wounded", description: "Appropriately handle walking wounded." }),
                    defineSkill({ id: "0IClhLmi", name: "Transport Patient", description: "Assist with a patient extraction/transport to CCP." }),
                    defineSkill({ id: "65x7f3mp", name: "Patient Care", description: "Maintain good patient care & privacy." }),
                ]
            }),
            defineGroup({
                id: "Yp7N4H9Y",
                name: "Medic",
                skills: [
                    defineSkill({ id: "HCqIB98b", name: "Patient Survey", description: "Conduct a primary and secondary survey." }),
                    defineSkill({ id: "AU7ehH8q", name: "Patient Report Form", description: "Complete a patient report form." }),
                    defineSkill({ id: "a8BSOwv7", name: "Monitor Patient", description: "Monitor a patient and record vitals." }),
                    defineSkill({ id: "sYYL2ruR", name: "Track Patients", description: "Track number of patients and locations." }),
                    defineSkill({ id: "bsLZZOHa", name: "Patient Handover", description: "Conduct a handover to ambulance." }),
                ]
            })
        ]
    }),
    definePackage({ 
        id: "Qpy5AijR", 
        name: "Out of Region", 
        sequence: 9,
        skillGroups: [
            defineGroup({
                id: "ddpJejLo",
                name: "Driving & 4WD",
                skills: [
                    defineSkill({ id: "F3fbLipk", name: "Drive on road", description: "Drive a team vehicle on road." }),
                    defineSkill({ id: "2N2UyQY9", name: "Drive a 4WD offroad", description: "Drive a 4WD off road." }),
                    defineSkill({ id: "I5QKhHHL", name: "Vehicle Maintenance", description: "Understand vehicle maintenance requirement (eg vehicle checks, tyre changes, etc.)" }),
                    defineSkill({ id: "vfMejU64", name: "Vehicle Limits", description: "Understand limits of driving in flood water approopriate to vehicle being driven." }),
                    defineSkill({ id: "wF30l2Z3", name: "Reverse Trailer", description: "Reverse a trailer including correct hitching and checking procedures.", optional: true }),
                    defineSkill({ id: "oY1xx1bK", name: "Vehicle Recovery", description: "Set up and use a vehicle recovery system, anchors, winching, and towing.", optional: true }),
                    defineSkill({ id: "yL5GkkBu", name: "Specialist Vehicle", description: "Operate a specialist vehicle (eg. Quad bike, Argo, side by side, etc)." }),
                    defineSkill({ id: "EE6iKSOy", name: "Operate jack or winch", description: "Operate a high lift lift, tirfor winch or other specialist equipment." }),
                ]
            }),
            defineGroup({
                id: "Lf76fZEP",
                name: "Out of Region Deployment",
                skills: [
                    defineSkill({ id: "WqG7PV59", name: "Deploy Out of Region", description: "Participate in an out-of-region deployment or exercise.", frequency: 'P2Y' }),
                    defineSkill({ id: "dXRGYgqz", name: "Out of Region Equipment", description: "Understands how to use the team's tents, cookers, toilets, wash stations,etc", frequency: 'P2Y' })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "J8B8YGAX", 
        name: "Leadership", 
        sequence: 10,
        skillGroups: [
            defineGroup({
                id: "2sSvq5A6",
                name: "Team Leadership",
                skills: [
                    defineSkill({ id: "rs5O8bme", name: "Lead", description: "Lead a team or squad effectively." }),
                    defineSkill({ id: "ynzgejKT", name: "Briefing", description: "Deliver a GSMEAC briefing for a task." }),
                    defineSkill({ id: "YNzNL6pL", name: "Debriefing", description: "Facilitate a DESC debrief." }),
                    defineSkill({ id: "QxpelduQ", name: "Situation Report", description: "Complete a situation report or handover (written or verbal)." }),
                ]
            }),
            defineGroup({
                id: "fqBMC6IA",
                name: "Safety Officer",
                skills: [
                    defineSkill({ id: "LDWZpaH5", name: "Base Induction", description: "Understand team base health and safety induction requirements." }),
                    defineSkill({ id: "3LOQrKq0", name: "Safety Briefing", description: "Deliver health and safety briefing." }),
                    defineSkill({ id: "RjxsGIQF", name: "Hazard Board", description: "Write and maintain a site hazard board." }),
                    defineSkill({ id: "tl183e5G", name: "Incident Report", description: "Complete an incident report form and complete follow-up actions/investigation." }),
                    defineSkill({ id: "IgGkGTVO", name: "Monitor Well-being", description: "Monitor and manage team well-being (eg. breaks, water, energy levels)" }),
                    defineSkill({ id: "XzqvjaUm", name: "Rope Systems Check", description: "Can complete a pre-operation system check of a rope system", optional: true }),
                ]
            })
        ]
    })
]

export function getGroupsInPackage(pkg: SkillPackageDef): SkillGroupDef[] {
    return pkg.skillGroups.flatMap(getGroupsInGroup)
}

export function getGroupsInGroup(group: SkillGroupDef): SkillGroupDef[] {
    return [group, ...group.subGroups.flatMap(getGroupsInGroup)]
}

export function getSkillsInPackage(pkg: SkillPackageDef): SkillDef[] {
    return pkg.skillGroups.flatMap(getSkillsInGroup)
}

export function getSkillsInGroup(group: SkillGroupDef): SkillDef[] {
    return [...group.skills, ...group.subGroups.flatMap(getSkillsInGroup)]
}


// const SkillGroupList = PackageList.flatMap(getGroupsInPackage)

// const SkillList = PackageList.flatMap(getSkillsInPackage)