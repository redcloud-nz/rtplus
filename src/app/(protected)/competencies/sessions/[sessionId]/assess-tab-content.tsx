/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import React from 'react'
import * as R from 'remeda'
import { useShallow } from 'zustand/react/shallow'

import { CompetenceLevel } from '@prisma/client'

import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import { useSkillPackagesQuery } from '@/lib/api/skills'
import { useTeamsWithMembersQuery } from '@/lib/api/teams'
import { CompetenceLevelTerms } from '@/lib/terms'

import { type SkillCheck_Client } from './skill-check-data'
import { findSkillCheck, useSkillCheckStore } from './skill-check-store'



export function AssessTabContent() {

    const [assesseeIds, skillIds, checks, updateSkillCheck] = useSkillCheckStore(useShallow(state => [state.assesseeIds, state.skillIds, state.checks, state.updateSkillCheck]))

    function getSkillCheck(skillId: string, assesseeId: string): SkillCheck_Client {
        return findSkillCheck(R.values(checks), skillId, assesseeId)
    }

    const skillPackagesQuery = useSkillPackagesQuery()
    const teamsQuery = useTeamsWithMembersQuery()

    const skills = React.useMemo(
        () => (skillPackagesQuery.data ?? []).flatMap(skillPackage => skillPackage.skills.filter(skill => skillIds.includes(skill.id))), 
        [skillIds, skillPackagesQuery.data]
    )

    const personnel = React.useMemo(
        () => (teamsQuery.data ?? []).flatMap(team => team.teamMemberships.map(member => member.person).filter(person => assesseeIds.includes(person.id))),
        [assesseeIds, teamsQuery.data]
    )
 
    const [selectedSkillId, setSelectedSkillId] = React.useState<string | 'NONE'>('NONE')
    const [selectedPersonId, setSelectedPersonId] = React.useState<string | 'NONE'>('NONE')
    
    const skillCheck = selectedSkillId != 'NONE' && selectedPersonId != 'NONE' ? getSkillCheck(selectedSkillId, selectedPersonId) : null

    function handleChange(partial: Partial<SkillCheck_Client>) {
        if(skillCheck) updateSkillCheck({ ...skillCheck, ...partial})
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
            <div className="grid md:grid-cols-2 gap-2 md:gap-4 divide-y md:divide-y-0">
                <div className="flex flex-col gap-2 pb-2 md:pb-0">

                    {/* Select Selector */}
                    <div className="space-y-1">
                        <Label>Skill</Label>
                        <Select 
                            value={selectedSkillId} 
                            onValueChange={setSelectedSkillId}
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

                    {/* Select Person */}
                    <div className="space-y-1">
                        <Label>Person</Label>
                        <Select 
                            value={selectedPersonId} 
                            onValueChange={setSelectedPersonId}
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
                <div className="flex flex-col gap-2 pt-2 md:pt-0">
                    
                    { selectedSkillId == 'NONE' && selectedPersonId != 'NONE' ? <div className="mt-7">
                        {/* Table show when a person is selected but a skill is not */}
                        <Table border>
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
                                                onClick={() => setSelectedSkillId(skill.id)}
                                            >{skill.name}</a>
                                        </TableCell>
                                        <TableCell>{skillCheck ? CompetenceLevelTerms[skillCheck.competenceLevel] : null}</TableCell>
                                </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </div> : null}

                    { selectedSkillId != 'NONE' && selectedPersonId == 'NONE' ? <div className="mt-7">
                        {/* Table show when a skill is selected but a person is not */}
                        <Table border>
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
                                                onClick={() => setSelectedPersonId(person.id)}
                                            >{person.name}</a>
                                        </TableCell>
                                        <TableCell>{skillCheck ? CompetenceLevelTerms[skillCheck.competenceLevel] : null}</TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </div> : null}

                    { selectedSkillId != 'NONE' && selectedPersonId != 'NONE' ? <>
                        {/* Form show when both a skill and a person are selected */}
                        <div className="space-y-1">
                            <Label>Result</Label>
                            <Select 
                                value={skillCheck?.competenceLevel} 
                                onValueChange={newValue => handleChange({ competenceLevel: newValue as CompetenceLevel })}
                            >
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
                            <Textarea 
                                value={skillCheck?.notes} 
                                onChange={ev => handleChange({ notes: ev.target.value })}
                            />
                        </div>
                    </> : null}
                </div>
                
            </div>
            
               
        </Show> : null}

        
    </>
}
