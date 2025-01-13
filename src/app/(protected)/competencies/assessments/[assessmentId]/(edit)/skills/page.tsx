/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)/skills
 */
'use client'

import React from 'react'
import { useShallow } from 'zustand/react/shallow'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Description } from '@/components/ui/typography'

import { SkillPackageWithGroupsAndSkills, useSkillPackagesQuery } from '@/lib/api/skills'
import { useAssessmentStore } from '../../assessment-store'


export default function AssessmentSkills() {

    const [skillIds, addSkill, removeSkill] = useAssessmentStore(useShallow(state => [state.skillIds, state.addSkill, state.removeSkill]))

    const skillPackagesQuery = useSkillPackagesQuery()

    function handleSelectSkill(skillId: string, checked: boolean) {
        if(checked) addSkill(skillId)
        else removeSkill(skillId)
    }

    return <>
        <Description>Select the skills to be assessed:</Description>
        { skillPackagesQuery.isPending ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { skillPackagesQuery.isSuccess ? <Accordion type="single" collapsible>
            {skillPackagesQuery.data.map(skillPackage => 
                <SkillPackageTree
                    key={skillPackage.id}
                    skillPackage={skillPackage} 
                    selectedSkills={skillIds} 
                    handleSelectSkill={handleSelectSkill}/>
                )}
        </Accordion> : null}
    </>
}

interface SkillPackageTreeProps {
    skillPackage: SkillPackageWithGroupsAndSkills
    selectedSkills: string[]
    handleSelectSkill(sillId: string, selected: boolean): void
}

/**
 * Component to render the skills that belong to a particular package.
 */
function SkillPackageTree({ skillPackage, selectedSkills, handleSelectSkill }: SkillPackageTreeProps) {
    const { id: packageId, skillGroups, skills } = skillPackage
    const skillCount = skills.length
    const selectedCount = skills.filter(skill => selectedSkills.includes(skill.id)).length

    function renderBranch(skillGroupId: string | null): React.ReactNode {
        return <React.Fragment key={skillGroupId}>
            {skills
                .filter(skill => skill.skillGroupId == skillGroupId)
                .map(skill => {
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
                })
            }
            {skillGroups
                .filter(childGroup => childGroup.parentId == skillGroupId)
                .map(childGroup => 
                    <div key={childGroup.id}>
                        <div className="pt-2 pb-1 text-sm font-semibold">{childGroup.name}</div>
                        {renderBranch(childGroup.id)}
                    </div>
                )
            }
        </React.Fragment>
    }

    return <AccordionItem value={packageId}>
        <AccordionTrigger>
            <div className="flex-grow text-left">{skillPackage.name}</div>
            <div className="text-xs text-muted-foreground mr-4">{selectedCount} of {skillCount} selected</div>
        </AccordionTrigger>
        <AccordionContent>
            <ul className="pl-2">
                {renderBranch(null)}
            </ul>
        </AccordionContent>
    </AccordionItem>
}