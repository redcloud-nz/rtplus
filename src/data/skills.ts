

export interface SampleCapability {
    id: string
    name: string
    skillGroups: SampleSkillGroup[]
}

export interface SampleSkillGroup {
    id: string
    name: string
    capabilityId: string
    skills: SampleSkill[]
}

export interface SampleSkill {
    id: string
    name: string
    skillGroupId: string
    optional: boolean
    frequency: number
    description: string
}

function defineCapability(id: string, name: string, children: Omit<SampleSkillGroup, 'capabilityId'>[]): SampleCapability {
    const skillGroups = children.map(group => ({ ...group, capabilityId: id }))

    return { id, name, skillGroups }
}

function defineGroup(id: string, name: string, children: Omit<SampleSkill, 'skillGroupId'>[]): Omit<SampleSkillGroup, 'capabilityId'> {
    const skills = children.map(skill => ({ ...skill, skillGroupId: id }))

    return { id, name, skills: skills}
}

interface SkillOptions {
    id: string
    name: string
    optional?: boolean
    frequency?: number
    description?: string
}

function defineSkill({ id, name, optional = false, frequency = 12, description = "" }: SkillOptions): Omit<SampleSkill, 'skillGroupId'> {
    return { id, name, optional, frequency, description }
}

export const CapabilityList: SampleCapability[] = [
    defineCapability("cm3zhh7l3002608l42rf4ehnj", "Foundation", [
        defineGroup("cm3zhkg53002g08l4dvz0b059", "First Aid", [
            defineSkill({ id: "cm3zgt6k0000608l4doi665zb", name: "First Aid Certificate", description: "Hold a current first aid certificate." }),
            defineSkill({ id: "cm3zguwzz000708l45ic3d8a6", name: "Patient Report Form", description: "Can complete a patient report form with basic observations." }),
            defineSkill({ id: "cm3zgv8sf000808l481zq2wel", name: "Package patient", description: "Can package a patient into a stretcher as a team member." }),
            defineSkill({ id: "cm3zgvlnv000908l4e9afeksc", name: "Apply First Aid", description: "Can apply first aid techniques to patient in a scenario." })
        ]),
        defineGroup("cm3zhkmi8002h08l4c2t8gjxp", "Soft Skills", [
            defineSkill({ id: "cm3zgvtol000a08l45g47dfke", name: "Cultural Awareness", description: "Demonstrate cultural awareness.", frequency: 24 }),
            defineSkill({ id: "cm3zgvxi8000b08l415kh7tet", name: "Psychological First Aid", description: "Demonstrate use of pschological first aid.", frequency: 24 })
        ]),
        defineGroup("cm3zhkt9c002i08l4hqcaclac", "Other", [
            defineSkill({ id: "cm3zgw4kd000c08l44e00csxx", name: "Staff a cordon", description: "Staff a cordon with appropriate PPE and make correct descisions about access." }),
            defineSkill({ id: "cm3zgw9im000d08l4fzc6a6rq", name: "Conduct reconaissance ", description: "Conduct reconaissance and pass on relevent information effectively."}),
            defineSkill({ id: "cm3zgwhx7000e08l4c4ex3j5f", name: "Deployment Process", description: "Demonstrate familiarity with the deployment process.", frequency: 24 }),
            defineSkill({ id: "cm3zgwmzb000f08l4ge2l36j6", name: "Generator", description: "Operate and maintain a generator." }),
            defineSkill({ id: "cm3zgwt5w000g08l465pg46jk", name: "Emergency Lighting System", description: "Operate and maintain an Emergency lighting system." }),
            defineSkill({ id: "cm3zgx0kr000h08l4aqvb4jgx", name: "Handheld Radios", description: "Operate and maintain handheld radios." }),
            defineSkill({ id: "cm3zgx5yz000i08l49plnbima", name: "Assist with ICP", description: "Assist with establishing team ICP facilities." }),
            defineSkill({ id: "cm3zgx9xc000j08l4ei2feu39", name: "Physical Assessment", description: "Fitness text/Physical assessment per NZRT Guidlines." })
        ]),
        defineGroup("cm3zhky8p002j08l4a0k7dvc3", "Communications", [
            defineSkill({ id: "cm3zgxtxc000k08l440ni4il0", name: "Comms Center", description: "Operate and manage a communications centre or hub." }),
            defineSkill({ id: "cm3zgxyhg000l08l47vrzhpd0", name: "Portable Repeater", description: "Set up a portable repeater or Cross Band.", frequency: 24 }),
            defineSkill({ id: "cm3zgy4uv000m08l48fvrcz50", name: "BGAN or Starlink", description: "Set up BGAN or Starlink alternative comms system.", frequency: 24 }),
            defineSkill({ id: "cm3zgy9az000n08l4a870gcsj", name: "Info Management", description: "Familiarity with team information management systems." })
        ])
    ]),
    defineCapability("cm3zhhjld002708l47mw1fuu2", "Light Rescue", [
        defineGroup("cm3zhl4ci002k08l40shkf9p3", "Knots and Lines", [
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
        ]),
        defineGroup("cm3zhlbdy002l08l4241c792w", "Search Techniques", [
            defineSkill({ id: "cm3zh29b0001208l46gur0qnw", name: "Correct PPE", description: "Wear correct PPE and complete a buddy check." }),
            defineSkill({ id: "cm3zh2dob001308l41jz24wul", name: "Rubble Crawl", description: "Rubble pile crawl with 3-points of contact." }),
            defineSkill({ id: "cm3zh2hxq001408l4awekbe05", name: "Line and Hail", description: "Participate in a line and hail search." }),
            defineSkill({ id: "cm3zh2ma7001508l47mcxf9my", name: "Site Recon", description: "Complet a reconaissance and hazard assessment of the site." }),
            defineSkill({ id: "cm3zh2r92001608l45tqfgp9k", name: "Victim Marking", description: "Complete an INSARAG victim marking." }),
            defineSkill({ id: "cm3zh2xn3001708l4bx8wghpi", name: "Site Map", description: "Map a site using USAR sides and quadrants." }),
            defineSkill({ id: "cm3zh338r001808l4gg8x53fx", name: "Occupant Interview", description: "Conduct an occupant or bystander interview." })
        ]),
        defineGroup("cm3zhlfrr002m08l4794kdobp", "Ladders", [
            defineSkill({ id: "cm3zh37rw001908l4gji27blh", name: "Extension Ladder", description: "Raise and lower an extension ladder." }),
            defineSkill({ id: "cm3zh3cc4001a08l4a5b1cfvi", name: "Secure Ladder", description: "Secure head and foot of ladder." }),
            defineSkill({ id: "cm3zh3gka001b08l4ghhjavd8", name: "Climb Ladder", description: "Climb a ladder with 3 points of contact, holding rungs." }),
            defineSkill({ id: "cm3zh3khy001c08l4gpb42s2h", name: "Mount/Dismount Ladder", description: "Correctly mount and dismount ladder at top." }),
            defineSkill({ id: "cm3zh3ow9001d08l45e7c4kmt", name: "Inspect Ladder", description: "Inspect ladder before and after use." })
        ]),
        defineGroup("cm3zhlomo002o08l4hybk1jex", "Stretchers", [
            defineSkill({ id: "cm3zh3u7c001e08l4bz4xb0x5", name: "Load Stretcher", description: "Load and blanket stretcher with patient secured correctly." }),
            defineSkill({ id: "cm3zh6r4j001f08l4beyj81kh", name: "Lash Stretcher", description: "Lash a patient in to basket stretcher." }),
            defineSkill({ id: "cm3zh6v7a001g08l45fzd2x2r", name: "Lowering Lines", description: "Attach lowering/tag lines to stretcher." }),
            defineSkill({ id: "cm3zh6zo2001h08l46v6w50wf", name: "Stretcher Carry", description: "Carry a stretcher across level ground." }),
            defineSkill({ id: "cm3zh757k001i08l48kk640yi", name: "Stretcher Pass", description: "Stretcher pass over uneven ground." }),
            defineSkill({ id: "cm3zh79b7001j08l4boud20lt", name: "Stretcher Pass on Slope", description: "Stretcher pass over sloping grouns with safety line attached." }),
            defineSkill({ id: "cm3zh7ddg001k08l482fy6y4b", name: "Lash Board Stretcher", description: "Lash a patient to a board stretcher.", optional: true }),
            defineSkill({ id: "cm3zh7ldn001l08l4gktp5ey4", name: "Lash NATO Stretcher", description: "Last a patient to a NATO stretcher.", optional: true }),
            defineSkill({ id: "cm3zh7q1u001m08l4c44c06oi", name: "Improvised harness", description: "Secure a patient into stretcher with an improvised harness.", optional: true }),
        ]),
        defineGroup("cm3zhlkmt002n08l470jq49z5", "ICP", [
            defineSkill({ id: "cm3zhabmm001o08l4flriha3h", name: "Sign in/out board", description: "Establish and maintain a sign in/out board or T-card system." })
        ]),
        defineGroup("cm3zhlul7002q08l4ehs7aoh2", "Lowers", [
            defineSkill({ id: "cm3zhahlc001p08l44swpcvyv", name: "Belay Anchors", description: "Establish top and/or bottom anchors for a lowering/belay system." }),
            defineSkill({ id: "cm3zhaltj001q08l49m990gm3", name: "Belay Stretcher", description: "Use a body belay or friction hitch to lower a stretcher." }),
            defineSkill({ id: "cm3zhaqmw001r08l4hm1j9a1e", name: "2-Point Lower", description: "Conduct a 2-point lower." }),
            defineSkill({ id: "cm3zhaw8c001s08l4hj6b5z9r", name: "4-Point Lower", description: "Conduct a 4-point lower." }),
            defineSkill({ id: "cm3zhb0cv001t08l4hl9thqor", name: "Mechanical Belay", description: "Use a mechanical belay device to lower a stretcher.", optional: true }),
            defineSkill({ id: "cm3zhb433001u08l42ei766xg", name: "Ladder Slide", description: "Conduct a ladder slide.", optional: true }),
            defineSkill({ id: "cm3zhb8lr001v08l4ajr47att", name: "Ladder Hinge", description: "Conduct a ladder hinge.", optional: true }),
            defineSkill({ id: "cm3zhbce2001w08l4578a05hq", name: "3:2:1 Picket System", description: "Set up a 3:2:1 picket system.", optional: true }),
            defineSkill({ id: "cm3zhbgyy001x08l4bsfa8hcx", name: "Single-Point Lower", description: "Conduct a single point lower", optional: true })
        ]),
        defineGroup("cm3zhlzat002r08l41b9h7lqa", "Improvised Casualty Movement", [
            defineSkill({ id: "cm3zhbmoq001y08l4h6tb5vnj", name: "Blanket/Clothing Lift", description: "Lift a patient using either a blanket lift or clothing lift. " }),
            defineSkill({ id: "cm3zhbqqx001z08l40tfc4fxa", name: "Human Crutch", description: "Assist a patient across a room using a human crutch." }),
            defineSkill({ id: "cm3zhbxap002008l4ee3m4d12", name: "2,3,4 Handed Seat", description: "Carry a patient using 2,3, and 4 handed seat." }),
            defineSkill({ id: "cm3zhc1kx002108l4doe3b6g0", name: "Pack Strap Carry", description: "Carry a patient using a pack strap carry." }),
            defineSkill({ id: "cm3zhc5wk002208l483rv56bl", name: "Fore and Aft Carry", description: "Carry a patient using a fore and aft carry." }),
            defineSkill({ id: "cm3zhcdll002308l4ciatb6wp", name: "Blanket/Clothing Drag", description: "Move a patient using a blanket drag or clothing drag." }),
            defineSkill({ id: "cm3zhcj9m002408l45il22s7u", name: "Firemans Crawl", description: "Move a patient using a firemans crawl.", optional: true }),
            defineSkill({ id: "cm3zhcn7d002508l4fdkv9rwg", name: "Shoulder/Stair Carry", description: "Move a patient using a should/stair drag.", optional: true })
        ])
    ]),
    defineCapability("cm3zhhy2w002808l4dqq2dp78", "Flood Response", []),
    defineCapability("cm3zhig8n002908l41xmr9fhc", "Storm Response", []),
    defineCapability("cm3zhils0002a08l4h3042wks", "CDC & Welfare", []),
    defineCapability("cm3zhipze002b08l4ehrfcksr", "Swiftwater Rescue", []),
    defineCapability("cm3zhiumg002c08l48pr90up1", "Rope Rescue", []),
    defineCapability("cm3zhiyz3002d08l450p818uf", "Mass Casualty Support", []),
    defineCapability("cm3zhj2xe002e08l464ycdj28", "Out of Region", []),
    defineCapability("cm3zhj6p3002f08l40i5b9gvf", "Leadership", [])
]

export const SkillGroupList = CapabilityList.flatMap(capability => capability.skillGroups)

export const SkillList = SkillGroupList.flatMap(skillGroup => skillGroup.skills)