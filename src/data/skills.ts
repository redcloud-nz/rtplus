

export interface SampleCapability {
    id: string
    name: string
    ref?: string
    skillGroups: SampleSkillGroup[]
}

export interface SampleSkillGroup {
    id: string
    name: string
    ref?: string
    capabilityId: string
    skills: SampleSkill[]
}

export interface SampleSkill {
    id: string
    name: string
    ref?: string
    skillGroupId: string
    optional: boolean
    frequency: string
    description: string
}

function defineCapability({ id, skillGroups, ...data }: Omit<SampleCapability, 'skillGroups'> & { skillGroups: Omit<SampleSkillGroup, 'capabilityId'>[] }): SampleCapability {
    const completeSkillGroups = skillGroups.map(group => ({ ...group, capabilityId: id }))

    return { id, skillGroups: completeSkillGroups, ...data }
}

function defineGroup({ id, skills, ...data }: Omit<SampleSkillGroup, 'capabilityId' | 'skills'> & { skills: Omit<SampleSkill, 'skillGroupId'>[] }): Omit<SampleSkillGroup, 'capabilityId'> {
    const completeSkills = skills.map(skill => ({ ...skill, skillGroupId: id }))

    return { id, skills: completeSkills, ...data }
}

interface SkillOptions {
    id: string
    name: string
    optional?: boolean
    frequency?: string
    description?: string
}

function defineSkill({ id, name, optional = false, frequency = 'P1Y', description = "" }: SkillOptions): Omit<SampleSkill, 'skillGroupId'> {
    return { id, name, optional, frequency, description }
}

export const CapabilityList: SampleCapability[] = [
    defineCapability({ 
        id: "cm3zhh7l3002608l42rf4ehnj", 
        name: "Foundation", 
        ref: "Foundation",
        skillGroups: [
            defineGroup({ 
                id: "cm3zhkg53002g08l4dvz0b059", 
                name: "First Aid", 
                skills: [
                    defineSkill({ id: "cm3zgt6k0000608l4doi665zb", name: "First Aid Certificate", description: "Hold a current first aid certificate." }),
                    defineSkill({ id: "cm3zguwzz000708l45ic3d8a6", name: "Patient Report Form", description: "Can complete a patient report form with basic observations." }),
                    defineSkill({ id: "cm3zgv8sf000808l481zq2wel", name: "Package patient", description: "Can package a patient into a stretcher as a team member." }),
                    defineSkill({ id: "cm3zgvlnv000908l4e9afeksc", name: "Apply First Aid", description: "Can apply first aid techniques to patient in a scenario." })
                ]
            }),
            defineGroup({ 
                id: "cm3zhkmi8002h08l4c2t8gjxp", 
                name: "Soft Skills", 
                skills: [
                    defineSkill({ id: "cm3zgvtol000a08l45g47dfke", name: "Cultural Awareness", description: "Demonstrate cultural awareness.", frequency: 'P2Y' }),
                    defineSkill({ id: "cm3zgvxi8000b08l415kh7tet", name: "Psychological First Aid", description: "Demonstrate use of pschological first aid.", frequency: 'P2Y' })
                ]
            }),
            defineGroup({ 
                id: "cm3zhkt9c002i08l4hqcaclac", 
                name: "Other", 
                skills: [
                    defineSkill({ id: "cm3zgw4kd000c08l44e00csxx", name: "Staff a cordon", description: "Staff a cordon with appropriate PPE and make correct descisions about access." }),
                    defineSkill({ id: "cm3zgw9im000d08l4fzc6a6rq", name: "Conduct reconaissance ", description: "Conduct reconaissance and pass on relevent information effectively."}),
                    defineSkill({ id: "cm3zgwhx7000e08l4c4ex3j5f", name: "Deployment Process", description: "Demonstrate familiarity with the deployment process.", frequency: 'P2Y' }),
                    defineSkill({ id: "cm3zgwmzb000f08l4ge2l36j6", name: "Generator", description: "Operate and maintain a generator." }),
                    defineSkill({ id: "cm3zgwt5w000g08l465pg46jk", name: "Emergency Lighting System", description: "Operate and maintain an Emergency lighting system." }),
                    defineSkill({ id: "cm3zgx0kr000h08l4aqvb4jgx", name: "Handheld Radios", description: "Operate and maintain handheld radios." }),
                    defineSkill({ id: "cm3zgx5yz000i08l49plnbima", name: "Assist with ICP", description: "Assist with establishing team ICP facilities." }),
                    defineSkill({ id: "cm3zgx9xc000j08l4ei2feu39", name: "Physical Assessment", description: "Fitness text/Physical assessment per NZRT Guidlines." })
                ]}
            ),
            defineGroup({ 
                id: "cm3zhky8p002j08l4a0k7dvc3", 
                name: "Communications", 
                skills: [
                    defineSkill({ id: "cm3zgxtxc000k08l440ni4il0", name: "Comms Center", description: "Operate and manage a communications centre or hub." }),
                    defineSkill({ id: "cm3zgxyhg000l08l47vrzhpd0", name: "Portable Repeater", description: "Set up a portable repeater or Cross Band.", frequency: 'P2Y' }),
                    defineSkill({ id: "cm3zgy4uv000m08l48fvrcz50", name: "BGAN or Starlink", description: "Set up BGAN or Starlink alternative comms system.", frequency: 'P2Y' }),
                    defineSkill({ id: "cm3zgy9az000n08l4a870gcsj", name: "Info Management", description: "Familiarity with team information management systems." })
                ]
            })
        ]
    }),
    defineCapability({ 
        id: "cm3zhhjld002708l47mw1fuu2", 
        name: "Light Rescue", 
        ref: "Light-Rescue", 
        skillGroups: [
            defineGroup({ 
                id: "cm3zhl4ci002k08l40shkf9p3", 
                name: "Knots and Lines", 
                skills: [
                    defineSkill({ id: "cm3zh06k4000o08l447bca3ic", name: "Single Figure 8", description: "Tie a single figure 8 knot." }),
                    defineSkill({ id: "cm3zh0d96000p08l4cb9lg7wn", name: "Figure 8 on the Bight", description: "Tie a figure 8 on the bight." }),
                    defineSkill({ id: "cm3zh0ig6000q08l4gr5wgg17", name: "Rethreaded Figure 8", description: "Tie a rethreaded figure 8." }),
                    defineSkill({ id: "cm3zh0nst000r08l48x3bfp31", name: "Joining 8", description: "Join two ropes with a joining 8 (figure 8 bend)." }),
                    defineSkill({ id: "cm3zh0t8q000s08l483m6gizu", name: "Round Turn and 2 half hitches", description: "Tie a round turn and 2 half hitches" }),
                    defineSkill({ id: "cm3zh0y62000t08l466axffnf", name: "Alpine Butterfly", description: "Tie an alpine butterfly knot." }),
                    defineSkill({ id: "cm3zh16ax000u08l4eawqd6qh", name: "Prussik Knot", description: "Tie a classic prussik knot." }),
                    defineSkill({ id: "cm3zh1akp000v08l41psh8wte", name: "Munter Hitch", description: "Tie a munter hitch (italian hitch)." }),
                    defineSkill({ id: "cm3zh1f2x000w08l42hlp44h4", name: "Clove Hitch", description: "Tie a clove hitch." }),
                    defineSkill({ id: "cm3zh1kxl000x08l4h128bljj", name: "Inspect Rope", description: "Inspect a rope and complete a rope log." }),
                    defineSkill({ id: "cm3zh1oxy000y08l42vrsah5z", name: "Industrial 8", description: "Tie and industrial 8 (2 loop figure 8).", optional: true }),
                    defineSkill({ id: "cm3zh1tj2000z08l4c5xqgbl8", name: "Tape Knot", description: "Tie a tape knot (water knot).", optional: true }),
                    defineSkill({ id: "cm3zh1xvk001008l40b6jbnv5", name: "Double Fishermans", description: "Join two ropes with a double fishers bend.", optional: true }),
                    defineSkill({ id: "cm3zh229w001108l4g1v72pcg", name: "Vertical Lift Knot", description: "Tie a vertical lift knot or improvised harness on another person.", optional: true })
                ]}
            ),
            defineGroup({ 
                id: "cm3zhlbdy002l08l4241c792w", 
                name: "Search Techniques", 
                skills: [
                    defineSkill({ id: "cm3zh29b0001208l46gur0qnw", name: "Correct PPE", description: "Wear correct PPE and complete a buddy check." }),
                    defineSkill({ id: "cm3zh2dob001308l41jz24wul", name: "Rubble Crawl", description: "Rubble pile crawl with 3-points of contact." }),
                    defineSkill({ id: "cm3zh2hxq001408l4awekbe05", name: "Line and Hail", description: "Participate in a line and hail search." }),
                    defineSkill({ id: "cm3zh2ma7001508l47mcxf9my", name: "Site Recon", description: "Complet a reconaissance and hazard assessment of the site." }),
                    defineSkill({ id: "cm3zh2r92001608l45tqfgp9k", name: "Victim Marking", description: "Complete an INSARAG victim marking." }),
                    defineSkill({ id: "cm3zh2xn3001708l4bx8wghpi", name: "Site Map", description: "Map a site using USAR sides and quadrants." }),
                    defineSkill({ id: "cm3zh338r001808l4gg8x53fx", name: "Occupant Interview", description: "Conduct an occupant or bystander interview." })
                ]}
            ),
            defineGroup({ 
                id: "cm3zhlfrr002m08l4794kdobp", 
                name: "Ladders", 
                skills: [
                    defineSkill({ id: "cm3zh37rw001908l4gji27blh", name: "Extension Ladder", description: "Raise and lower an extension ladder." }),
                    defineSkill({ id: "cm3zh3cc4001a08l4a5b1cfvi", name: "Secure Ladder", description: "Secure head and foot of ladder." }),
                    defineSkill({ id: "cm3zh3gka001b08l4ghhjavd8", name: "Climb Ladder", description: "Climb a ladder with 3 points of contact, holding rungs." }),
                    defineSkill({ id: "cm3zh3khy001c08l4gpb42s2h", name: "Mount/Dismount Ladder", description: "Correctly mount and dismount ladder at top." }),
                    defineSkill({ id: "cm3zh3ow9001d08l45e7c4kmt", name: "Inspect Ladder", description: "Inspect ladder before and after use." })
                ]}
            ),
            defineGroup({ 
                id: "cm3zhlomo002o08l4hybk1jex", 
                name: "Stretchers", 
                skills: [
                    defineSkill({ id: "cm3zh3u7c001e08l4bz4xb0x5", name: "Load Stretcher", description: "Load and blanket stretcher with patient secured correctly." }),
                    defineSkill({ id: "cm3zh6r4j001f08l4beyj81kh", name: "Lash Stretcher", description: "Lash a patient in to basket stretcher." }),
                    defineSkill({ id: "cm3zh6v7a001g08l45fzd2x2r", name: "Lowering Lines", description: "Attach lowering/tag lines to stretcher." }),
                    defineSkill({ id: "cm3zh6zo2001h08l46v6w50wf", name: "Stretcher Carry", description: "Carry a stretcher across level ground." }),
                    defineSkill({ id: "cm3zh757k001i08l48kk640yi", name: "Stretcher Pass", description: "Stretcher pass over uneven ground." }),
                    defineSkill({ id: "cm3zh79b7001j08l4boud20lt", name: "Stretcher Pass on Slope", description: "Stretcher pass over sloping grouns with safety line attached." }),
                    defineSkill({ id: "cm3zh7ddg001k08l482fy6y4b", name: "Lash Board Stretcher", description: "Lash a patient to a board stretcher.", optional: true }),
                    defineSkill({ id: "cm3zh7ldn001l08l4gktp5ey4", name: "Lash NATO Stretcher", description: "Last a patient to a NATO stretcher.", optional: true }),
                    defineSkill({ id: "cm3zh7q1u001m08l4c44c06oi", name: "Improvised harness", description: "Secure a patient into stretcher with an improvised harness.", optional: true }),
                ]}
            ),
            defineGroup({ 
                id: "cm3zhlkmt002n08l470jq49z5", 
                name: "ICP", 
                skills: [
                    defineSkill({ id: "cm3zhabmm001o08l4flriha3h", name: "Sign in/out board", description: "Establish and maintain a sign in/out board or T-card system." })
                ]
            }),
            defineGroup({ 
                id: "cm3zhlul7002q08l4ehs7aoh2", 
                name: "Lowers", 
                skills: [
                    defineSkill({ id: "cm3zhahlc001p08l44swpcvyv", name: "Belay Anchors", description: "Establish top and/or bottom anchors for a lowering/belay system." }),
                    defineSkill({ id: "cm3zhaltj001q08l49m990gm3", name: "Belay Stretcher", description: "Use a body belay or friction hitch to lower a stretcher." }),
                    defineSkill({ id: "cm3zhaqmw001r08l4hm1j9a1e", name: "2-Point Lower", description: "Conduct a 2-point lower." }),
                    defineSkill({ id: "cm3zhaw8c001s08l4hj6b5z9r", name: "4-Point Lower", description: "Conduct a 4-point lower." }),
                    defineSkill({ id: "cm3zhb0cv001t08l4hl9thqor", name: "Mechanical Belay", description: "Use a mechanical belay device to lower a stretcher.", optional: true }),
                    defineSkill({ id: "cm3zhb433001u08l42ei766xg", name: "Ladder Slide", description: "Conduct a ladder slide.", optional: true }),
                    defineSkill({ id: "cm3zhb8lr001v08l4ajr47att", name: "Ladder Hinge", description: "Conduct a ladder hinge.", optional: true }),
                    defineSkill({ id: "cm3zhbce2001w08l4578a05hq", name: "3:2:1 Picket System", description: "Set up a 3:2:1 picket system.", optional: true }),
                    defineSkill({ id: "cm3zhbgyy001x08l4bsfa8hcx", name: "Single-Point Lower", description: "Conduct a single point lower", optional: true })
                ]
            }),
            defineGroup({ 
                id: "cm3zhlzat002r08l41b9h7lqa", 
                name: "Improvised Casualty Movement", 
                skills: [
                    defineSkill({ id: "cm3zhbmoq001y08l4h6tb5vnj", name: "Blanket/Clothing Lift", description: "Lift a patient using either a blanket lift or clothing lift. " }),
                    defineSkill({ id: "cm3zhbqqx001z08l40tfc4fxa", name: "Human Crutch", description: "Assist a patient across a room using a human crutch." }),
                    defineSkill({ id: "cm3zhbxap002008l4ee3m4d12", name: "2,3,4 Handed Seat", description: "Carry a patient using 2,3, and 4 handed seat." }),
                    defineSkill({ id: "cm3zhc1kx002108l4doe3b6g0", name: "Pack Strap Carry", description: "Carry a patient using a pack strap carry." }),
                    defineSkill({ id: "cm3zhc5wk002208l483rv56bl", name: "Fore and Aft Carry", description: "Carry a patient using a fore and aft carry." }),
                    defineSkill({ id: "cm3zhcdll002308l4ciatb6wp", name: "Blanket/Clothing Drag", description: "Move a patient using a blanket drag or clothing drag." }),
                    defineSkill({ id: "cm3zhcj9m002408l45il22s7u", name: "Firemans Crawl", description: "Move a patient using a firemans crawl.", optional: true }),
                    defineSkill({ id: "cm3zhcn7d002508l4fdkv9rwg", name: "Shoulder/Stair Carry", description: "Move a patient using a should/stair drag.", optional: true })
                ]
            })
        ]
    }),
    defineCapability({ 
        id: "cm3zhhy2w002808l4dqq2dp78", 
        name: "Flood Response", 
        ref: "Flood", 
        skillGroups: [
            defineGroup({
                id: "cm4etjxw8000008kv210j1qmh",
                name: "Flood Protection",
                skills: [
                    defineSkill({ id: "cm4etqhwr000008kv4vfie4vz", name: "Pumps", description: "Operate pumps (including priming and maintenance requirements)." }),
                    defineSkill({ id: "cm4etqmod000108kv3unla7jg", name: "Sand Bagging", description: "Effective sand bagging as a team or alternate flood barrier systems." }),
                    defineSkill({ id: "cm4etqqsl000208kv2ogf6bj1", name: "Divert Water", description: "Divert water for salvage." }),
                    defineSkill({ id: "cm4etqv8v000308kvcd1kc2hp", name: "Ring Dyke", description: "Take part in forming a ring dyke." }),
                    defineSkill({ id: "cm4etqzj8000408kve4593y3y", name: "Drain Hazards", description: "Identifies hazards when clearing drains." }),
                    defineSkill({ id: "cm4etr408000508kv5kyp8qzc", name: "Decontamination", description: "Conducts decontamination procedures", optional: true })
                ]
            }),
            defineGroup({
                id: "cm4etku18000108kvd7knditd",
                name: "Water Safety",
                skills: [
                    defineSkill({ id: "cm4etr8xy000608kv1lbue53y", name: "Correct PPE", description: "Correct PPE work and buddy checked" }),
                    defineSkill({ id: "cm4etrd3k000708kvhe0857ny", name: "Priorities and Safety", description: "Understands or demonstrates priority of rescue (low to high risk) and reqs for upstream & downstream safety" }),
                    defineSkill({ id: "cm4etrhcu000808kv0hbxcxzt", name: "Wading Poles", description: "Use wading poles/sticks to check surface for safety." }),
                    defineSkill({ id: "cm4etrm0q000908kv2hxb5213", name: "River Crossing", description: "Demonstrate a river crossing technique as a team" }),
                    defineSkill({ id: "cm4etrq91000a08kvgd2l0s8g", name: "Swimming", description: "Swimming (aggressive and defensive) with correct ferry angle" }),
                    defineSkill({ id: "cm4etrv1j000b08kvci84g5nw", name: "Throw Bags", description: "Throw bag accurately 10-15m" }),
                    defineSkill({ id: "cm4etrze2000c08kvfw6cgr93", name: "Swim to Eddy", description: "Able to swim to an eddy" }),
                    defineSkill({ id: "cm4ets403000d08kvgozi5u4d", name: "Tension Diagonal", description: "Can rig a tension diagonal", optional: true }),
                    defineSkill({ id: "cm4etsb4f000e08kvhedr0qat", name: "Boat on Tether", description: "Can perform a boat on tether (4-point)" })
                ]
            })
        ]
    }),
    defineCapability({ 
        id: "cm3zhig8n002908l41xmr9fhc", 
        name: "Storm Response", 
        ref: "Storm", 
        skillGroups: [
            defineGroup({
                id: "cm4etydjb000f08kvexju27a2",
                name: "Storm",
                skills: [
                    defineSkill({ id: "cm4eu5436000i08kvhyaf77h3", name: "Appropriate Anchors", description: "Choose appropriate anchors and rig correctly." }),
                    defineSkill({ id: "cm4eu589b000j08kvcz4g33jw", name: "Setup Roof System", description: "Setup a roof acces system." }),
                    defineSkill({ id: "cm4eu5cl4000k08kv75qaaopf", name: "Use Roof System", description: "Use a roof access system (limiting fall factor)." }),
                    defineSkill({ id: "cm4eu5gam000l08kv7mat5q3d", name: "Roof Repairs", description: "Perform temorary roof repairs." }),
                    defineSkill({ id: "cm4eu5gam000l08kv7mat5q3d", name: "Rescue from Roor", description: "Practice rescue from roof by lowering system." }),
                    defineSkill({ id: "cm4eu5obb000n08kvf1427ldb", name: "Secure furniture", description: "Secure furniture/fittings, demonstrate salvage techniques." }),
                    defineSkill({ id: "cm4eu5sy2000o08kv3cfw6i6s", name: "Window Cover", description: "Make a temporary window cover." }),
                    defineSkill({ id: "cm4eu5x98000p08kv3j7lfur5", name: "Inspect Equipment", description: "Inspect and log use of height equipment (ropes & hardware, etc)." }),
                ]
            }),
            defineGroup({
                id: "cm4etyvri000g08kv5h8b8uxj",
                name: "Chainsaws",
                skills: [
                    defineSkill({ id: "cm4eua4qq000q08kv2gadb749", name: "Chainsaw PPE", description: "Wears correct PPE when using a chainsaw", optional: true }),
                    defineSkill({ id: "cm4eua9fq000r08kv01oj4xuq", name: "Chainsaw Handling", description: "Can demonstrate safe chainsaw handling, functional parts, and maintenance.", optional: true }),
                    defineSkill({ id: "cm4euadti000s08kv3u1k4qvy", name: "Safe Fueling", description: "Can demonstrate safe fueling and oiling procedures", optional: true }),
                    defineSkill({ id: "cm4euahzr000t08kv8n2mg7nq", name: "Start Procedures", description: "Can demonstrate correct cold and hot starting procedures.", optional: true }),
                    defineSkill({ id: "cm4eualu7000u08kv6p700lw9", name: "Saw Correctly", description: "Use the saw correctly and safely when cutting", optional: true }),
                    defineSkill({ id: "cm4euapt2000v08kvc3nu6ko0", name: "Area of Operation", description: "Has knowledge of areas of operation and escape routes", optional: true })
                ]
            })
        ]
    }),
    defineCapability({ 
        id: "cm3zhils0002a08l4h3042wks", 
        name: "CDC & Welfare", 
        ref: "Welfare", 
        skillGroups: []
    }),
    defineCapability({ 
        id: "cm3zhipze002b08l4ehrfcksr", 
        name: "Swiftwater Rescue", 
        ref: "Swiftwater", 
        skillGroups: []
    }),
    defineCapability({ 
        id: "cm3zhiumg002c08l48pr90up1", 
        name: "Rope Rescue", 
        ref: "Rope", 
        skillGroups: []
    }),
    defineCapability({ 
        id: "cm3zhiyz3002d08l450p818uf", 
        name: "Mass Casualty Support", 
        ref: "Mass-Casualty", 
        skillGroups: []
    }),
    defineCapability({ 
        id: "cm3zhj2xe002e08l464ycdj28", 
        name: "Out of Region", 
        ref: "Out-Of-Region", 
        skillGroups: []
    }),
    defineCapability({ 
        id: "cm3zhj6p3002f08l40i5b9gvf", 
        name: "Leadership", 
        ref: "Leadership", 
        skillGroups: []
    })
]

export const SkillGroupList = CapabilityList.flatMap(capability => capability.skillGroups)

export const SkillList = SkillGroupList.flatMap(skillGroup => skillGroup.skills)