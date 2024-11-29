'use client'

import React from 'react'


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import { CapabilityList } from '@/data/skills'
import { Description } from '@/components/ui/typography'


export default function AssessmentSkills({ params }: { params: { assessmentId: string } }) {

    const [selectedSkills, setSelectedSkills] = React.useState<Record<string, boolean>>({})

    function handleSelectSkill(skillId: string, checked: boolean) {
        setSelectedSkills(prev => ({ ...prev, [skillId]: checked }))
    }

    return <>
        <Description>Select the skills to be assessed:</Description>
        <Accordion type="single" collapsible>
            {CapabilityList.map(capability => {
                const skillsInCapability = capability.skillGroups.flatMap(skillGroup => skillGroup.skills)
                const skillCount = skillsInCapability.length
                const selectedCount = skillsInCapability.filter(skill => selectedSkills[skill.id]).length


                return <AccordionItem key={capability.id} value={capability.id}>
                    <AccordionTrigger>
                        <div className="flex-grow text-left">{capability.name}</div>
                        {selectedCount ? <div className="text-xs text-muted-foreground mr-4">{selectedCount} of {skillCount} selected</div> : null }
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="pl-2">
                            {capability.skillGroups.map(skillGroup => {
                            return <div key={skillGroup.id}>
                                <div className="pt-2 pb-1 text-sm font-semibold">{skillGroup.name}</div>
                                {skillGroup.skills.map(skill => {
                                    return <li key={skill.id} className="flex items-top space-x-2 py-1 px-2">
                                        <Checkbox id={`checkbox-${skill.id}`} 
                                            checked={selectedSkills[skill.id] ?? false}
                                            onCheckedChange={(checked) => handleSelectSkill(skill.id, checked === true)}
                                        />
                                        <div className="grid gap-1.5 leading-none ">
                                            <Label htmlFor={`checkbox-${skill.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{skill.name}</Label>
                                            {skill.description ? <p className="text-sm text-muted-foreground">{skill.description}</p> : null}
                                        </div>
                                    </li>
                                })}
                            </div>
                            })}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            })}
        </Accordion>
    </>
}