/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { createRandomSlug, UUIDValidationSet } from '@/lib/id'

export interface SkillPackageDef {
    id: string
    name: string
    slug: string
    sequence: number
    skillGroups: SkillGroupDef[]
    skills: SkillDef[]
}

export interface SkillGroupDef {
    id: string
    name: string
    slug: string
    skillPackageId: string
    parentId: string | null
    sequence: number
    subGroups: SkillGroupDef[]
    skills: SkillDef[]
}

export interface SkillDef {
    id: string
    name: string
    slug: string
    skillPackageId: string
    skillGroupId: string | null
    optional: boolean
    frequency: string
    description: string
    sequence: number
}

const PLACEHOLDER = 'PLACEHOLDER' as const

const vSet = new UUIDValidationSet()

type SkillPackageArgs = Omit<SkillPackageDef, | 'skills' | 'skillGroups'> & Partial<Pick<SkillPackageDef, 'skills' | 'skillGroups'>>

function definePackage({ id: skillPackageId, slug, ...pkg }: SkillPackageArgs): SkillPackageDef {
    function patchSkill(skill: SkillDef, skillGroupId: string | null, sequence: number): SkillDef {
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
        slug,
        skillGroups: (pkg.skillGroups ?? []).map((skillGroup, groupIndex) => patchSkillGroup(skillGroup, null, groupIndex+1)),
        skills: (pkg.skills ?? []).map((skill, skillIndex) => patchSkill(skill, null, skillIndex+1))
    }
}

type SkillGroupArgs = Omit<SkillGroupDef, 'skillPackageId' | 'parentId' | 'sequence' | 'subGroups'> & Partial<Pick<SkillGroupDef, 'subGroups'>>

function defineGroup({id, slug, skills, subGroups = [], ...data }: SkillGroupArgs): SkillGroupDef {
    vSet.validate(id)

    return { id, slug: slug ?? null, skillPackageId: PLACEHOLDER, parentId: PLACEHOLDER, sequence: -1, skills, subGroups, ...data }
}

interface SkillArgs {
    id: string
    name: string
    slug?: string
    optional?: boolean
    frequency?: string
    description?: string
}

function defineSkill({ id, name, slug = createRandomSlug(), optional = false, frequency = 'P1Y', description = "" }: SkillArgs): SkillDef {
    vSet.validate(id)

    return { id, name, slug, skillPackageId: PLACEHOLDER, skillGroupId: PLACEHOLDER, optional, frequency, description, sequence: -1 }
}

export const PackageList: SkillPackageDef[] = [
    definePackage({ 
        id: "729d82a9-a4e1-41c2-9452-bc6a041dbad5", 
        name: "Foundation", 
        slug: "Foundation",
        sequence: 1,
        skillGroups: [
            defineGroup({ 
                id: "37c63e6d-db66-40bf-b524-c3a2f88a2793", 
                name: "First Aid",
                slug: "First-Aid",
                skills: [
                    defineSkill({ id: "82581b82-1e54-46e0-97b4-9e774bac653f", name: "First Aid Certificate", description: "Hold a current first aid certificate." }),
                    defineSkill({ id: "984022b5-7e36-4179-aa72-183c31be72bd", name: "Patient Report Form", description: "Can complete a patient report form with basic observations." }),
                    defineSkill({ id: "a9a1d895-3276-4b34-b051-be67d08dc21c", name: "Package patient", description: "Can package a patient into a stretcher as a team member." }),
                    defineSkill({ id: "aec2fb73-5dc5-4538-ae71-d91098fe604b", name: "Apply First Aid", description: "Can apply first aid techniques to patient in a scenario." })
                ]
            }),
            defineGroup({ 
                id: "2c6f6a20-0621-49c9-8a67-1e03e4cbe7a8", 
                name: "Soft Skills", 
                slug: "Soft-Skills",
                skills: [
                    defineSkill({ id: "adf47ffc-2200-4c7c-b47f-f7fc8b632692", name: "Cultural Awareness", description: "Demonstrate cultural awareness.", frequency: 'P2Y' }),
                    defineSkill({ id: "4a2a15e9-4242-49e6-a469-c9c552812797", name: "Psychological First Aid", description: "Demonstrate use of psychological first aid.", frequency: 'P2Y' })
                ]
            }),
            defineGroup({ 
                id: "23170811-034e-46af-8161-76eec3db0114", 
                name: "Other",
                slug: "Foundation-Other",
                skills: [
                    defineSkill({ id: "a2f4e52f-0836-4031-8558-7c066cb0c35f", name: "Staff a cordon", description: "Staff a cordon with appropriate PPE and make correct decisions about access." }),
                    defineSkill({ id: "7ffcae57-6c41-4c96-b9d5-6dfbde583d64", name: "Conduct reconnaissance", description: "Conduct reconnaissance and pass on relevant information effectively."}),
                    defineSkill({ id: "710ccb8a-dcf0-455a-b150-c2f1cc5ca288", name: "Deployment Process", description: "Demonstrate familiarity with the deployment process.", frequency: 'P2Y' }),
                    defineSkill({ id: "1636d413-13d7-445c-b50f-d0f07186c888", name: "Generator", description: "Operate and maintain a generator." }),
                    defineSkill({ id: "f38be007-5965-4fb4-874c-6f7b26963df9", name: "Emergency Lighting System", description: "Operate and maintain an Emergency lighting system." }),
                    defineSkill({ id: "125bd9d5-c514-4209-9a72-7308ba28b325", name: "Handheld Radios", description: "Operate and maintain handheld radios." }),
                    defineSkill({ id: "330a99a0-c1e2-4e47-bbc6-684097a10bfd", name: "Assist with ICP", description: "Assist with establishing team ICP facilities." }),
                    defineSkill({ id: "794fe778-371f-4ef3-9fec-c94f05e21dde", name: "Physical Assessment", description: "Fitness test/Physical assessment per NZRT Guidelines." })
                ]}
            ),
            defineGroup({ 
                id: "bac3e167-bcc1-40c4-93e7-e10eff5440c5", 
                name: "Communications",
                slug: "Communications",
                skills: [
                    defineSkill({ id: "f802d82b-96f5-4b79-8c97-e7ee2b6f0a4f", name: "Comms Center", description: "Operate and manage a communications centre or hub." }),
                    defineSkill({ id: "ceb18650-c8c6-4c8d-aee6-1b8200096890", name: "Portable Repeater", description: "Set up a portable repeater or Cross Band.", frequency: 'P2Y' }),
                    defineSkill({ id: "8fc6cc8b-25a3-4853-9bb5-ba2b668419e9", name: "BGAN or Starlink", description: "Set up BGAN or Starlink alternative comms system.", frequency: 'P2Y' }),
                    defineSkill({ id: "1463bf27-4459-4347-9cc7-e0d924990302", name: "Info Management", description: "Familiarity with team information management systems." })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "04d86835-f898-45cd-bf8a-7254a819437a", 
        name: "Light Rescue", 
        slug: "Light-Rescue", 
        sequence: 2,
        skillGroups: [
            defineGroup({ 
                id: "65b1a42b-ede1-451c-8951-a07101224b15", 
                name: "Knots and Lines",
                slug: "Knots",
                skills: [
                    defineSkill({ id: "2c6f03d9-72cc-4398-8777-083875eb9d76", name: "Single Figure 8", description: "Tie a single figure 8 knot." }),
                    defineSkill({ id: "440a9fc8-1f05-44b8-b213-ec5fc95caf10", name: "Figure 8 on the Bight", description: "Tie a figure 8 on the bight." }),
                    defineSkill({ id: "d28434d0-6131-4f13-9f04-a72d91ab8179", name: "Rethreaded Figure 8", description: "Tie a rethreaded figure 8." }),
                    defineSkill({ id: "f4c753c7-ae2e-45de-9224-6794a9626ba4", name: "Joining 8", description: "Join two ropes with a joining 8 (figure 8 bend)." }),
                    defineSkill({ id: "dac82ab3-d7c8-4388-894c-ba6965212627", name: "Round Turn and 2 half hitches", description: "Tie a round turn and 2 half hitches" }),
                    defineSkill({ id: "5c92a324-e5d1-4df1-ae94-2d4e1e99ac14", name: "Alpine Butterfly", description: "Tie an alpine butterfly knot." }),
                    defineSkill({ id: "5156fc36-1d41-42a8-9145-623dd3a28428", name: "Prussik Knot", description: "Tie a classic prussik knot." }),
                    defineSkill({ id: "0a414216-9d62-4745-917c-6f4c1e8682dd", name: "Munter Hitch", description: "Tie a munter hitch (italian hitch)." }),
                    defineSkill({ id: "6b0cae37-2258-402a-acb5-175ceb627cbe", name: "Clove Hitch", description: "Tie a clove hitch." }),
                    defineSkill({ id: "7b896064-acf1-42a6-abfb-c250390c033c", name: "Inspect Rope", description: "Inspect a rope and complete a rope log." }),
                    defineSkill({ id: "c839c133-3971-4b7e-a038-b05737ebeabf", name: "Industrial 8", description: "Tie and industrial 8 (2 loop figure 8).", optional: true }),
                    defineSkill({ id: "aab6567e-fb41-43ed-bb46-ee1142d14b44", name: "Tape Knot", description: "Tie a tape knot (water knot).", optional: true }),
                    defineSkill({ id: "b94ee6fa-aaa8-475e-8c71-472724f0bd19", name: "Double Fishermans", description: "Join two ropes with a double fishers bend.", optional: true }),
                    defineSkill({ id: "155c7a8e-d9e5-4529-ab1d-21b69acdc3f2", name: "Vertical Lift Knot", description: "Tie a vertical lift knot or improvised harness on another person.", optional: true })
                ]}
            ),
            defineGroup({ 
                id: "d3b71571-eaa8-409f-a42d-9ceb7c03a1ff", 
                name: "Search Techniques", 
                slug: "Search",
                skills: [
                    defineSkill({ id: "f82342f8-bedc-46e7-becc-6df961290d88", name: "Correct PPE", description: "Wear correct PPE and complete a buddy check." }),
                    defineSkill({ id: "87542a1e-8764-4f98-9e57-8322e1ad191c", name: "Rubble Crawl", description: "Rubble pile crawl with 3-points of contact." }),
                    defineSkill({ id: "38cd9512-731f-42cb-bf28-c2379f400ff9", name: "Line and Hail", description: "Participate in a line and hail search." }),
                    defineSkill({ id: "e9525373-755c-4f9a-bf77-f846844d12f6", name: "Site Recon", description: "Complet a reconaissance and hazard assessment of the site." }),
                    defineSkill({ id: "dce5c7d0-865f-448e-9b7d-09d2d88b8ba5", name: "Victim Marking", description: "Complete an INSARAG victim marking." }),
                    defineSkill({ id: "864326f5-532c-42a7-8cba-11855aef96ca", name: "Site Map", description: "Map a site using USAR sides and quadrants." }),
                    defineSkill({ id: "25fb97ab-2750-4c04-b234-86c0025bab6f", name: "Occupant Interview", description: "Conduct an occupant or bystander interview." })
                ]}
            ),
            defineGroup({ 
                id: "1798714f-e135-42b2-b793-4c4ccecaa572", 
                name: "Ladders", 
                slug: "Ladders",
                skills: [
                    defineSkill({ id: "50d39290-efb7-42ad-8a47-ae301216126d", name: "Extension Ladder", description: "Raise and lower an extension ladder." }),
                    defineSkill({ id: "7c701e44-9fef-494b-a964-2bf3a099ab0b", name: "Secure Ladder", description: "Secure head and foot of ladder." }),
                    defineSkill({ id: "c9dd43ec-b099-46f1-ba8e-5857862d5e03", name: "Climb Ladder", description: "Climb a ladder with 3 points of contact, holding rungs." }),
                    defineSkill({ id: "aed4deaf-7425-4e4e-84f2-a3bf37586ddc", name: "Mount/Dismount Ladder", description: "Correctly mount and dismount ladder at top." }),
                    defineSkill({ id: "23edffd7-4aaf-41d9-b4db-b29fbede0d38", name: "Inspect Ladder", description: "Inspect ladder before and after use." })
                ]}
            ),
            defineGroup({ 
                id: "a0403b3e-ee04-4932-b87d-66bf70dfb56d", 
                name: "Stretchers", 
                slug: "Stretchers",
                skills: [
                    defineSkill({ id: "d89c7087-dbc2-4d69-a5ea-0dc977f0b468", name: "Load Stretcher", description: "Load and blanket stretcher with patient secured correctly." }),
                    defineSkill({ id: "9664efca-3ba0-4842-87f5-5a000d66e09e", name: "Lash Stretcher", description: "Lash a patient in to basket stretcher." }),
                    defineSkill({ id: "29578174-c2cb-42d5-b1c2-4a43b1c48302", name: "Lowering Lines", description: "Attach lowering/tag lines to stretcher." }),
                    defineSkill({ id: "366bd22a-ef3a-47cc-80a7-cec9556c25c9", name: "Stretcher Carry", description: "Carry a stretcher across level ground." }),
                    defineSkill({ id: "d309a2f7-f750-4093-a8dd-5b0a0f4cfe89", name: "Stretcher Pass", description: "Stretcher pass over uneven ground." }),
                    defineSkill({ id: "e903f241-2d87-4451-bf3f-7730c20132f2", name: "Stretcher Pass on Slope", description: "Stretcher pass over sloping grouns with safety line attached." }),
                    defineSkill({ id: "5a462c5c-8e3a-4bd5-b375-1a1eb2cd0a54", name: "Lash Board Stretcher", description: "Lash a patient to a board stretcher.", optional: true }),
                    defineSkill({ id: "c66ac4cb-4de4-4a4d-a16b-f55bebd96e6c", name: "Lash NATO Stretcher", description: "Last a patient to a NATO stretcher.", optional: true }),
                    defineSkill({ id: "267c9c63-c6bf-43ec-b193-194f2f8351f5", name: "Improvised harness", description: "Secure a patient into stretcher with an improvised harness.", optional: true }),
                ]}
            ),
            defineGroup({ 
                id: "5039c135-d76a-4018-8222-40b414c4f816", 
                name: "ICP",
                slug: "ICP",
                skills: [
                    defineSkill({ id: "f488201c-e44b-479c-93d0-ef4d7a24c33c", name: "Sign in/out board", description: "Establish and maintain a sign in/out board or T-card system." })
                ]
            }),
            defineGroup({ 
                id: "21b2c038-0827-49e3-8999-c875df2ff1ce", 
                name: "Lowers", 
                slug: "Lowers",
                skills: [
                    defineSkill({ id: "a480ecf7-6080-4ded-880a-006c79f7318e", name: "Belay Anchors", description: "Establish top and/or bottom anchors for a lowering/belay system." }),
                    defineSkill({ id: "51897a32-7fe0-4f09-bd02-02ac67ab7cde", name: "Belay Stretcher", description: "Use a body belay or friction hitch to lower a stretcher." }),
                    defineSkill({ id: "b5a1dd5f-d69f-4d15-9657-b42392635c35", name: "2-Point Lower", description: "Conduct a 2-point lower." }),
                    defineSkill({ id: "e44c670c-3d86-4a01-9c94-38c173675c16", name: "4-Point Lower", description: "Conduct a 4-point lower." }),
                    defineSkill({ id: "84b71c3b-f850-4ab6-9a08-0ad2ee830e3b", name: "Mechanical Belay", description: "Use a mechanical belay device to lower a stretcher.", optional: true }),
                    defineSkill({ id: "82050054-2549-4956-ae4a-a25363df6a0e", name: "Ladder Slide", description: "Conduct a ladder slide.", optional: true }),
                    defineSkill({ id: "4dcc3e46-bd11-4ebb-b038-4274fb32cf87", name: "Ladder Hinge", description: "Conduct a ladder hinge.", optional: true }),
                    defineSkill({ id: "65430a21-6cee-4be2-aff2-30dc69ed262c", name: "3:2:1 Picket System", description: "Set up a 3:2:1 picket system.", optional: true }),
                    defineSkill({ id: "ca075fc6-15a0-43f5-aed5-d4eb82a06711", name: "Single-Point Lower", description: "Conduct a single point lower", optional: true })
                ]
            }),
            defineGroup({ 
                id: "0efa6e4a-f954-45ee-961c-4425c4ec08cb", 
                name: "Improvised Casualty Movement",
                slug: "Improvised-Casualty-Movement",
                skills: [
                    defineSkill({ id: "c161d197-fa71-4e37-8666-f88fb1d66c3f", name: "Blanket/Clothing Lift", description: "Lift a patient using either a blanket lift or clothing lift. " }),
                    defineSkill({ id: "a0f1ae50-bb03-437b-bb72-dbc33704f928", name: "Human Crutch", description: "Assist a patient across a room using a human crutch." }),
                    defineSkill({ id: "798523e7-b6b8-43ac-a352-5d2135dd9445", name: "2,3,4 Handed Seat", description: "Carry a patient using 2,3, and 4 handed seat." }),
                    defineSkill({ id: "ebe1443a-192a-4f9b-a9be-3873fd81d815", name: "Pack Strap Carry", description: "Carry a patient using a pack strap carry." }),
                    defineSkill({ id: "421e7f8a-29d4-47ad-a70e-046a478cd6f5", name: "Fore and Aft Carry", description: "Carry a patient using a fore and aft carry." }),
                    defineSkill({ id: "b2287c82-ab88-4710-9798-340463137983", name: "Blanket/Clothing Drag", description: "Move a patient using a blanket drag or clothing drag." }),
                    defineSkill({ id: "d64a97d7-0090-4238-81ef-b4fb69f4bd0f", name: "Firemans Crawl", description: "Move a patient using a firemans crawl.", optional: true }),
                    defineSkill({ id: "cc16cb00-32dd-4304-9118-5d1c4c70d8af", name: "Shoulder/Stair Carry", description: "Move a patient using a should/stair drag.", optional: true })
                ]
            })
        ]
    }),
    definePackage({
        id: "c7746384-e443-46e6-9217-18142be12c1f", 
        name: "Flood Response", 
        slug: "Flood", 
        sequence: 3,
        skillGroups: [
            defineGroup({
                id: "9a46c2d3-4719-49db-be74-622b0ae60619",
                name: "Flood Protection",
                slug: "Flood-Protection",
                skills: [
                    defineSkill({ id: "57b5c4bb-912f-46fe-ac4d-aa0c9374d249", name: "Pumps", description: "Operate pumps (including priming and maintenance requirements)." }),
                    defineSkill({ id: "08395761-a4c4-4c41-b181-b34e0ac6c922", name: "Sand Bagging", description: "Effective sand bagging as a team or alternate flood barrier systems." }),
                    defineSkill({ id: "b94759f1-5925-443b-a43c-be9301632d20", name: "Divert Water", description: "Divert water for salvage." }),
                    defineSkill({ id: "33b82f65-b61d-44f8-8cc3-b8d1c2a0a9d3", name: "Ring Dyke", description: "Take part in forming a ring dyke." }),
                    defineSkill({ id: "7b171b52-9c2a-4305-a81c-84d2c49cb0d4", name: "Drain Hazards", description: "Identifies hazards when clearing drains." }),
                    defineSkill({ id: "982f11cf-5d5f-4a6d-a193-7b795da1ed68", name: "Decontamination", description: "Conducts decontamination procedures", optional: true })
                ]
            }),
            defineGroup({
                id: "a8c8384f-9eb0-4115-a249-ab52a85f8f53",
                name: "Water Safety",
                slug: "Water-Safety",
                skills: [
                    defineSkill({ id: "10790bc7-30d9-41a0-80d9-32ae959184b4", name: "Correct PPE", description: "Correct PPE work and buddy checked" }),
                    defineSkill({ id: "776b2888-7d0a-47d9-8806-5b743f0c21cd", name: "Priorities and Safety", description: "Understands or demonstrates priority of rescue (low to high risk) and reqs for upstream & downstream safety" }),
                    defineSkill({ id: "a4bcf0da-de84-48e3-bb2b-bdbcc5a02ece", name: "Wading Poles", description: "Use wading poles/sticks to check surface for safety." }),
                    defineSkill({ id: "a812f07a-8776-40ce-a581-a9a90d877237", name: "River Crossing", description: "Demonstrate a river crossing technique as a team" }),
                    defineSkill({ id: "cda1d5c2-885f-4beb-9567-b861e5a3632b", name: "Swimming", description: "Swimming (aggressive and defensive) with correct ferry angle" }),
                    defineSkill({ id: "9bdd8b3d-a331-493f-b0e6-c71ddf1cf269", name: "Throw Bags", description: "Throw bag accurately 10-15m" }),
                    defineSkill({ id: "1483704f-db9d-46a4-b2ab-6c74c0572536", name: "Swim to Eddy", description: "Able to swim to an eddy" }),
                    defineSkill({ id: "7a594426-9a90-467f-984e-5f39c58548b0", name: "Tension Diagonal", description: "Can rig a tension diagonal", optional: true }),
                    defineSkill({ id: "4607fa9f-121c-4561-a2d7-49b0be8b8507", name: "Boat on Tether", description: "Can perform a boat on tether (4-point)" })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "1402fccc-bbf5-4079-81fc-0adab7c426cd", 
        name: "Storm Response", 
        slug: "Storm", 
        sequence: 4,
        skillGroups: [
            defineGroup({
                id: "e8083684-0cad-467c-8278-118616b3b1dc",
                name: "Storm",
                slug: "Storm",
                skills: [
                    defineSkill({ id: "ab6f7774-bb9e-471a-8196-4eb9255370f3", name: "Appropriate Anchors", description: "Choose appropriate anchors and rig correctly." }),
                    defineSkill({ id: "6b3b1fb3-0df0-4ca3-9265-de6e5f678138", name: "Setup Roof System", description: "Setup a roof access system." }),
                    defineSkill({ id: "e67368d4-3674-4a89-8b28-bd0b879c5a28", name: "Use Roof System", description: "Use a roof access system (limiting fall factor)." }),
                    defineSkill({ id: "e66b5e31-610a-4979-8a5d-7390d84bbd2f", name: "Roof Repairs", description: "Perform temorary roof repairs." }),
                    defineSkill({ id: "1b6b699f-9c9c-46ef-8795-9359e4bbdf36", name: "Rescue from Roor", description: "Practice rescue from roof by lowering system." }),
                    defineSkill({ id: "d4f33375-0076-4269-aeb8-2117e64e1ec5", name: "Secure furniture", description: "Secure furniture/fittings, demonstrate salvage techniques." }),
                    defineSkill({ id: "b0975b34-0256-4d1f-b1a6-81c5808aee9c", name: "Window Cover", description: "Make a temporary window cover." }),
                    defineSkill({ id: "007d3df8-6dae-4af6-a7d2-4cabcd509688", name: "Inspect Equipment", description: "Inspect and log use of height equipment (ropes & hardware, etc)." }),
                ]
            }),
            defineGroup({
                id: "fd3204ee-915b-456a-96c6-0e47dcf93d62",
                name: "Chainsaws",
                slug: "Chairsaws",
                skills: [
                    defineSkill({ id: "39e04a84-a94a-4de1-a3f6-a432f37c7764", name: "Chainsaw PPE", description: "Wears correct PPE when using a chainsaw", optional: true }),
                    defineSkill({ id: "12aa9ded-76af-4937-9a83-5892fc217251", name: "Chainsaw Handling", description: "Can demonstrate safe chainsaw handling, functional parts, and maintenance.", optional: true }),
                    defineSkill({ id: "332032aa-a5de-4fae-a0d2-2df402ee5507", name: "Safe Fueling", description: "Can demonstrate safe fueling and oiling procedures", optional: true }),
                    defineSkill({ id: "a0d55ad3-1225-4d4f-9a82-e240934422e3", name: "Start Procedures", description: "Can demonstrate correct cold and hot starting procedures.", optional: true }),
                    defineSkill({ id: "d938e2db-bb8b-4768-8e81-05d9483008c7", name: "Saw Correctly", description: "Use the saw correctly and safely when cutting", optional: true }),
                    defineSkill({ id: "f1eef9e0-db98-47e3-9681-f4a882d06d9f", name: "Area of Operation", description: "Has knowledge of areas of operation and escape routes", optional: true })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "94536808-8754-40fc-a215-6deec25e58d7", 
        name: "CDC & Welfare", 
        slug: "Welfare", 
        sequence: 5,
        skillGroups: [
            defineGroup({
                id: "06bbacf1-a5ce-49bd-a488-f30f9ffb0ff3",
                name: "Civil Defence Centres and Welfare",
                slug: "CDC",
                skills: [
                    defineSkill({ id: "bbef6076-181b-4f72-8bc0-5b3a4a70067f", name: "Establish CDC", description: "Establish/setup a CDC as part of a team." }),
                    defineSkill({ id: "969d21fb-8e18-458e-8e65-6235b02a1dbf", name: "Staff CDC", description: "Act as a CDC staff member" }),
                    defineSkill({ id: "6932343c-b935-4715-a7f2-63064a65072f", name: "Needs Assessment", description: "Conduct a needs assessment." }),
                    defineSkill({ id: "b3a671b4-0d99-4cfe-8ea7-02c512ae70b0", name: "Privacy", description: "Privacy measures are taken when conducting needs assessment." }),
                    defineSkill({ id: "3e82f637-c988-478b-a869-7c4bc41e87c5", name: "Animal Welfare", description: "Understand animal welfare requirements at a CDC", optional: true }),
                ]
            })
        ]
    }),
    definePackage({ 
        id: "33afba28-f132-4391-bedb-eab4a5105fde", 
        name: "Swiftwater Rescue", 
        slug: "Swiftwater", 
        sequence: 6,
        skillGroups: [
            defineGroup({
                id: "8b7f895b-5d6e-4973-bbb0-e741196afe9a",
                name: "Responder",
                slug: "Swiftwater-Responder",
                skills: []
            }),
            defineGroup({
                id: "c5dc9a6b-96ed-4290-8b28-d9f5a74bf339",
                name: "Technician",
                slug: "Swiftwater-Technician",
                skills: []
            }),
            defineGroup({
                id: "d2faf53f-2365-4743-b5e4-bd42a417058c",
                name: "Technician Advanced",
                slug: "Switftwater-Technician-Advanced",
                skills: []
            }),
            defineGroup({
                id: "384b7998-ac78-456f-89df-6c8cf452be0d",
                name: "Other",
                slug: "Swiftwater-Other",
                skills: []
            }),
            defineGroup({
                id: "3ac8cd9d-3561-4b39-a453-e1cc4e312c3a",
                name: "Non-powered Craft",
                slug: "Swiftwater-Non-Powered-Craft",
                skills: []
            }),
            defineGroup({
                id: "157c6abb-467b-48ea-bf24-b52d12e008e3",
                name: "Powered Craft",
                slug: "Swiftwater-Powered-Craft",
                skills: []
            }),
            defineGroup({
                id: "eeb978ab-0ea6-4ae9-bd97-a11970d85ad4",
                name: "Rescue from Vehicle",
                slug: "Swiftwater-Rescue-Vehicle",
                skills: []
            })
        ]
    }),
    definePackage({ 
        id: "008c4441-3119-4fff-b16e-7f88ee6fba48", 
        name: "Rope Rescue", 
        slug: "Rope", 
        sequence: 7,
        skillGroups: [
            defineGroup({
                id: "019e9647-ff86-45a1-aae2-259be7322b88",
                name: "Responder",
                slug: "Rope-Responder",
                skills: []
            }),
            defineGroup({
                id: "455d90c4-baae-41ab-85e1-e570fce58bea",
                name: "Technician",
                slug: "Rope-Technician",
                skills: []
            }),
            defineGroup({
                id: "c471e862-b068-467a-a267-6bbafb7aa8ff",
                name: "Specialist",
                slug: "Rope-Specialist",
                skills: []
            }),
        ]
    }),
    definePackage({ 
        id: "7e68ea5d-d17f-426b-a991-6478a2a57f40", 
        name: "Mass Casualty Support", 
        slug: "Mass-Casualty", 
        sequence: 8,
        skillGroups: [
            defineGroup({
                id: "c2f50c53-cd0f-439d-92b0-e0a87cfa9d69",
                name: "Mass Casualty",
                slug: "Mass-Casualty",
                skills: [
                    defineSkill({ id: "bb8602f4-bebb-4ac4-a3f0-0b7aff7c50f9", name: "Establish CCP", description: "Help to establish a Casualty Collection Point (including seperate area for deceased)." }),
                    defineSkill({ id: "5e336cf0-ab5d-45b1-a93a-e989be4fe91a", name: "Conduct Triage", description: "Conduct rapid traige using S.T.A.R.T. system." }),
                    defineSkill({ id: "797e9b65-5af0-4ac4-9bab-6083be16cc39", name: "Triage Tag", description: "Complete a victim triage tag." }),
                    defineSkill({ id: "e1729f27-6994-42b9-ada9-25f8e89ca1b3", name: "Walking Wounded", description: "Appropriately handle walking wounded." }),
                    defineSkill({ id: "17de3675-42f2-48ba-8c38-9e8267dbaf96", name: "Transport Patient", description: "Assist with a patient extraction/transport to CCP." }),
                    defineSkill({ id: "07ab9657-8ca7-4e28-a131-6c680dce1632", name: "Patient Care", description: "Maintain good patient care & privacy." }),
                ]
            }),
            defineGroup({
                id: "1cceb937-b8b1-40ac-b01b-ad75d8e75170",
                name: "Medic",
                slug: "Medic",
                skills: [
                    defineSkill({ id: "25cbb65b-2983-40c0-a324-70a5a2b249a4", name: "Patient Survey", description: "Conduct a primary and secondary survey." }),
                    defineSkill({ id: "f4ae3d5a-c43f-4b97-ac28-3c4da6175ee4", name: "Patient Report Form", description: "Complete a patient report form." }),
                    defineSkill({ id: "5502e5d1-1153-4ff0-8993-5deeefc637f7", name: "Monitor Patient", description: "Monitor a patient and record vitals." }),
                    defineSkill({ id: "6f260ab5-7b24-477a-bf99-8dd1e3e78ea7", name: "Track Patients", description: "Track number of patients and locations." }),
                    defineSkill({ id: "7acc259e-144e-4592-8f18-0a06088fa340", name: "Patient Handover", description: "Conduct a handover to ambulance." }),
                ]
            })
        ]
    }),
    definePackage({ 
        id: "ef13f4ee-de20-4384-82d9-8fd842e4cbf7", 
        name: "Out of Region", 
        slug: "Out-Of-Region", 
        sequence: 9,
        skillGroups: [
            defineGroup({
                id: "01ab9f72-deda-4a05-801f-5e3280e1ff39",
                name: "Driving & 4WD",
                slug: "Driving",
                skills: [
                    defineSkill({ id: "36712cb9-9cca-49de-9905-fd00671a9286", name: "Drive on road", description: "Drive a team vehicle on road." }),
                    defineSkill({ id: "dc7b223c-33d9-4412-9861-abea31a810e2", name: "Drive a 4WD offroad", description: "Drive a 4WD off road." }),
                    defineSkill({ id: "8c36da85-65b4-4818-a25e-50a1d2adc932", name: "Vehicle Maintenance", description: "Understand vehicle maintenance requirement (eg vehicle checks, tyre changes, etc.)" }),
                    defineSkill({ id: "b1b8795c-9a92-4ee1-a9a1-5969947ecf5d", name: "Vehicle Limits", description: "Understand limits of driving in flood water approopriate to vehicle being driven." }),
                    defineSkill({ id: "f38c3595-91f8-4763-8a65-084f647c2b08", name: "Reverse Trailer", description: "Reverse a trailer including correct hitching and checking procedures.", optional: true }),
                    defineSkill({ id: "1f04e3ef-2ab5-4796-8b90-1379b5e39e32", name: "Vehicle Recovery", description: "Set up and use a vehicle recovery system, anchors, winching, and towing.", optional: true }),
                    defineSkill({ id: "31be7631-f4f4-4347-bfc0-20d3cf789848", name: "Specialist Vehicle", description: "Operate a specialist vehicle (eg. Quad bike, Argo, side by side, etc)." }),
                    defineSkill({ id: "bf630163-e515-412a-a11f-ee2514bb7be8", name: "Operate jack or winch", description: "Operate a high lift lift, tirfor winch or other specialist equipment." }),
                ]
            }),
            defineGroup({
                id: "6aa34ccd-8875-421d-a8ef-131dcb1abe3e",
                name: "Out of Region Deployment",
                slug: "Out-Of-Region",
                skills: [
                    defineSkill({ id: "b215175b-31cb-4d14-847f-0ead5fdc9c03", name: "Deploy Out of Region", description: "Participate in an out-of-region deployment or exercise.", frequency: 'P2Y' }),
                    defineSkill({ id: "e2ec94c4-47ee-47fa-9927-d4385850aad0", name: "Out of Region Equipment", description: "Understands how to use the team's tents, cookers, toilets, wash stations,etc", frequency: 'P2Y' })
                ]
            })
        ]
    }),
    definePackage({ 
        id: "6207d93f-ada3-4ef6-bc6b-a5ebc46daa89", 
        name: "Leadership", 
        slug: "Leadership", 
        sequence: 10,
        skillGroups: [
            defineGroup({
                id: "80deca5f-7bd2-4f02-b542-6a6f2e08c99f",
                name: "Team Leadership",
                slug: "Team-Leadership",
                skills: [
                    defineSkill({ id: "4515c1c4-cbbe-4ad4-8bff-bc1a8167847f", name: "Lead", description: "Lead a team or squad effectively." }),
                    defineSkill({ id: "2b9f8d1b-bc8d-4100-ac17-cd2839afb6a4", name: "Briefing", description: "Deliver a GSMEAC briefing for a task." }),
                    defineSkill({ id: "9dc4bf3a-58ce-4452-b221-56663206bb70", name: "Debriefing", description: "Facilitate a DESC debrief." }),
                    defineSkill({ id: "cdb0c394-8912-4a91-8421-db29805c62a9", name: "Situation Report", description: "Complete a situation report or handover (written or verbal)." }),
                ]
            }),
            defineGroup({
                id: "d54a7a9d-8fc9-45dc-bef2-7db17d50a3b4",
                name: "Safety Officer",
                slug: "Safety-Officer",
                skills: [
                    defineSkill({ id: "afe2964d-08a0-4350-a8e6-1a7405860444", name: "Base Induction", description: "Understand team base health and safety induction requirements." }),
                    defineSkill({ id: "8d423031-c7b1-4bd9-9586-9114ad5b31cb", name: "Safety Briefing", description: "Deliver health and safety briefing." }),
                    defineSkill({ id: "cf54fd34-d095-418a-8e75-2b1eb1c9bf2b", name: "Hazard Board", description: "Write and maintain a site hazard board." }),
                    defineSkill({ id: "46b4753d-656c-4667-a13a-405de5171638", name: "Incident Report", description: "Complete an incident report form and complete follow-up actions/investigation." }),
                    defineSkill({ id: "61ba93cc-4dfb-4dfc-b238-f16357c8d4fe", name: "Monitor Well-being", description: "Monitor and manage team well-being (eg. breaks, water, energy levels)" }),
                    defineSkill({ id: "2f2ff348-1ae3-4e46-8691-fce4573ea67d", name: "Rope Systems Check", description: "Can complete a pre-operation system check of a rope system", optional: true }),
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
    return [...pkg.skills, ...pkg.skillGroups.flatMap(getSkillsInGroup)]
}

export function getSkillsInGroup(group: SkillGroupDef): SkillDef[] {
    return [...group.skills, ...group.subGroups.flatMap(getSkillsInGroup)]
}


// const SkillGroupList = PackageList.flatMap(getGroupsInPackage)

// const SkillList = PackageList.flatMap(getSkillsInPackage)