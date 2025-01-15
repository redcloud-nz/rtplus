/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/assessments/[assessmentId]/(edit)/assess
 */
'use client'

import React from 'react'
import * as R from 'remeda'
import { useShallow } from 'zustand/react/shallow'

import { CompetenceLevel } from '@prisma/client'

import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import { useSkillPackagesQuery } from '@/lib/api/skills'
import { useTeamsWithMembersQuery } from '@/lib/api/teams'
import { CompetenceLevelTerms } from '@/lib/terms'

import { SkillCheck_Client, useSkillCheckStore } from '../../skill-check-store'


export default function SessionAssessPage() {

    const [assesseeIds, skillIds] = useSkillCheckStore(useShallow(state => [state.assesseeIds, state.skillIds]))
    const getSkillCheck = useSkillCheckStore(state => state.getSkillCheck)

    const skillPackagesQuery = useSkillPackagesQuery()
    const teamsQuery = useTeamsWithMembersQuery()

    const skills = React.useMemo(
        () => (skillPackagesQuery.data ?? []).flatMap(skillPackage => skillPackage.skills.filter(skill => skillIds.includes(skill.id))), 
        [skillIds, skillPackagesQuery.data]
    )

    const personnel = React.useMemo(
        () => (teamsQuery.data ?? []).flatMap(team => team.memberships.map(member => member.person).filter(person => assesseeIds.includes(person.id))),
        [assesseeIds, teamsQuery.data]
    )
 
    const [selectedSkillId, setSelectedSkillId] = React.useState<string | 'NONE'>('NONE')
    const [selectedPersonId, setSelectedPersonId] = React.useState<string | 'NONE'>('NONE')
    const [skillCheck, setSkillCheck] = React.useState<SkillCheck_Client | null>(null)

    
    function handleSelectSkill(skillId: string | 'NONE') {
        console.log(`handleSelectSkill(${skillId}). selectedPersonId=${selectedPersonId}`)
        setSelectedSkillId(skillId)
        if(skillId == 'NONE' || selectedPersonId == 'NONE') setSkillCheck(null)
        else setSkillCheck(getSkillCheck(skillId, selectedPersonId))
    }

    function handleSelectPerson(personId: string | 'NONE') {
        console.log(`handleSelectPerson(${personId}). selectedSkillId=${selectedSkillId}`)
        setSelectedPersonId(personId)
        if(personId == 'NONE' || selectedSkillId == 'NONE') setSkillCheck(null)
        else setSkillCheck(getSkillCheck(selectedSkillId, personId))
    }

    function handleChange(partial: Partial<SkillCheck_Client>) {
        setSkillCheck(prev => prev == null ? null : { ...prev, ...partial })
    }

    async function handleSave() {
        console.log(`handleSave()`, skillCheck)
        if(skillCheck == null) {
            console.error("skillCheck must be defined to be saved.")
            return
        }
    }

    function handleReset() {
        setSkillCheck(getSkillCheck(selectedSkillId, selectedPersonId))
    }

    return <>

        { (skillPackagesQuery.isPending || teamsQuery.isPending) ? <div className="flex flex-col items-stretch gap-2">
            <Skeleton className="h-8"/>
            <Skeleton className="h-8"/>
        </div> : null}
        { (skillPackagesQuery.isSuccess && teamsQuery.isSuccess) ? <Show
            when={skills.length > 0 && personnel.length > 0}
            fallback={<>
                { skills.length == 0 ? <Alert severity="info" title="No skills selected.">Go select some skills to include in the assessment.</Alert> : null}
                { personnel.length == 0 ? <Alert severity="info" title="No personnel selected.">Go select some personnel to include in the assessment.</Alert> : null}
            </>}
        >
            <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                <div className="flex flex-col gap-2">
                    <div className="space-y-1">
                        <Label>Skill</Label>
                        <Select 
                            value={selectedSkillId} 
                            onValueChange={handleSelectSkill}
                        >
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">All Skills</SelectItem>
                                <SelectGroup>
                                    <SelectLabel>Skills</SelectLabel>
                                    {skills.map(skill => 
                                        <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Person</Label>
                        <Select 
                            value={selectedPersonId} 
                            onValueChange={handleSelectPerson}
                        >
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">All Personnel</SelectItem>
                                <SelectGroup>
                                    <SelectLabel>Personnel</SelectLabel>
                                    {personnel.map(person => 
                                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    { selectedSkillId == 'NONE' && selectedPersonId != 'NONE' ? <div className="mt-7"><Table border>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell></TableHeadCell>
                                <TableHeadCell>Skill</TableHeadCell>
                                <TableHeadCell>Result</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skills.map((skill, index) => {
                                const skillCheck = getSkillCheck(skill.id, selectedPersonId)

                                return <TableRow key={skill.id}>
                                    <TableCell className="text-center">{index+1}</TableCell>
                                    <TableCell>
                                        <a 
                                            className="hover:cursor-pointer"
                                            onClick={() => handleSelectSkill(skill.id)}
                                        >{skill.name}</a>
                                    </TableCell>
                                    <TableCell>{skillCheck?.competenceLevel}</TableCell>
                            </TableRow>
                            })}
                        </TableBody>
                    </Table></div> : null}
                    { selectedSkillId != 'NONE' && selectedPersonId == 'NONE' ? <div className="mt-7"><Table border>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell></TableHeadCell>
                                <TableHeadCell>Person</TableHeadCell>
                                <TableHeadCell>Result</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {personnel.map((person, index) =>{
                                const skillCheck = getSkillCheck(selectedSkillId, person.id)
                                
                                return <TableRow key={person.id}>
                                    <TableCell className="text-center">{index+1}</TableCell>
                                    <TableCell>
                                        <a 
                                            className="hover:cursor-pointer" 
                                            onClick={() => handleSelectPerson(person.id)}
                                        >{person.name}</a>
                                    </TableCell>
                                    <TableCell>{skillCheck?.competenceLevel}</TableCell>
                                </TableRow>
                            })}
                        </TableBody>
                    </Table></div> : null}
                    { selectedSkillId != 'NONE' && selectedPersonId != 'NONE' ? <>
                        <div className="space-y-1">
                            <Label>Result</Label>
                            <Select value={skillCheck?.competenceLevel} onValueChange={newValue => handleChange({ competenceLevel: newValue as CompetenceLevel })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select competence level"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Competence Level</SelectLabel>
                                        {R.entries(CompetenceLevelTerms).map(([key, label]) =>
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Notes</Label>
                            <Textarea value={skillCheck?.notes} onChange={ev => handleChange({ notes: ev.target.value })}/>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <AsyncButton onClick={handleSave} label="Save" pending="Saving" reset/>
                            <Button variant="outline" onClick={handleReset}>Reset</Button>
                        </div>
                    </> : null}
                </div>
                
            </div>
            
               
        </Show> : null}

        
    </>
}
