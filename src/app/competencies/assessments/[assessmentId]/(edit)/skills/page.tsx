'use client'

import _ from 'lodash'
import React from 'react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Description } from '@/components/ui/typography'

import { useSkillsTreeQuery } from '@/lib/api/skills'

import { useAssessmentContext } from '../../../assessment-context'


export default function AssessmentSkills({}: { params: { assessmentId: string } }) {

    const assessmentContext = useAssessmentContext()

    const selectedSkills = assessmentContext.value.skillIds

    const skillsTreeQuery = useSkillsTreeQuery()

    function handleSelectSkill(skillId: string, checked: boolean) {

        assessmentContext.updateValue(prev => ({
            ...prev, 
            skillIds: checked
                ? [...prev.skillIds, skillId]
                : _.without(prev.skillIds, skillId)
        }))
    }

    return <>
        <Description>Select the skills to be assessed:</Description>
        { skillsTreeQuery.isPending ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { skillsTreeQuery.isSuccess ? <Accordion type="single" collapsible>
            {skillsTreeQuery.data.map(capability => {
                
                const skillsInCapability = capability.skillGroups.flatMap(skillGroup => skillGroup.skills)
                const skillCount = skillsInCapability.length
                const selectedCount = skillsInCapability.filter(skill => selectedSkills.includes(skill.id)).length

                return <AccordionItem key={capability.id} value={capability.id}>
                    <AccordionTrigger>
                        <div className="flex-grow text-left">{capability.name}</div>
                        <div className="text-xs text-muted-foreground mr-4">{selectedCount} of {skillCount} selected</div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="pl-2">
                            {capability.skillGroups.map(skillGroup => {
                            return <div key={skillGroup.id}>
                                <div className="pt-2 pb-1 text-sm font-semibold">{skillGroup.name}</div>
                                {skillGroup.skills.map(skill => {
                                    return <li key={skill.id} className="flex items-top space-x-2 py-1 px-2">
                                        <Checkbox id={`checkbox-${skill.id}`} 
                                            checked={selectedSkills.includes(skill.id) || false}
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
        </Accordion> : null}
    </>
}