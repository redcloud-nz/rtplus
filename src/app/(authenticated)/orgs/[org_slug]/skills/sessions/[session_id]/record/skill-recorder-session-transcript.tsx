/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatDistanceToNow } from 'date-fns'
import { useMemo, useState } from 'react'
import { partition } from 'remeda'
import { match } from 'ts-pattern'

import { useSuspenseQueries } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Label } from '@/components/ui/label'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'

import { CompetenceLevel, CompetenceLevelIndicator, CompetenceLevels, CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { toPercentage } from '@/lib/utils'

import { trpc } from '@/trpc/client'



/**
 * Skill Recorder Tab that shows a transcript of recorded skill checks for a session.
 */
export function SkillRecorder_Session_Transcript({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const [
        { data: currentPerson },
        { data: availablePackages }, 
        { data: assignedAssessees }, 
        { data: assignedSkillIds },
        { data: checks },
    ] = useSuspenseQueries({
        queries: [
            trpc.personnel.getCurrentPerson.queryOptions({ orgId: organization.orgId }),
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
        ],
    })

    const skills = useMemo(() => availablePackages.flatMap(pkg => pkg.skills), [availablePackages])
    const assignedSkills = useMemo(() => skills.filter(skill => assignedSkillIds.includes(skill.skillId)), [skills, assignedSkillIds])
    const checksByUser = useMemo(() => checks.filter(check => check.assessorId === currentPerson!.personId), [checks, currentPerson])

    const [usedAssessees, unusedAssessees] = useMemo(() => partition(assignedAssessees, assessee => checksByUser.some(check => check.assesseeId === assessee.personId)), [assignedAssessees, checksByUser])
    const [usedSkills, unusedSkills] = useMemo(() => partition(assignedSkills, skill => checksByUser.some(check => check.skillId === skill.skillId)), [assignedSkills, checksByUser])

    const [displayMode, setDisplayMode] = useState<{ assessor: 'all' | 'me', groupBy: 'assessee' | 'skill' }>({ assessor: 'me', groupBy: 'assessee' })

    return <div className="my-4 flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-4">
            {/* <div className="flex justify-center items-center gap-4">
                <Label htmlFor="transcript-assessor-filter">Showing:</Label>
                <S2_Select value={displayMode.assessor} onValueChange={value => setDisplayMode(prev => ({ ...prev, assessor: value as 'all' | 'me' }))} disabled>
                    <S2_SelectTrigger className="w-auto sm:w-40" id="transcript-assessor-filter">
                        <S2_SelectValue placeholder="Select Assessors"/>
                    </S2_SelectTrigger>
                    <S2_SelectContent>
                        <S2_SelectItem value="all">All Assessors</S2_SelectItem>
                        <S2_SelectItem value="me">Only Me</S2_SelectItem>
                    </S2_SelectContent>
                </S2_Select>
            </div> */}
            
            <div className="flex justify-center items-center gap-4">
                <Label htmlFor="transcript-group-by-filter">Grouped By:</Label>
                <S2_Select value={displayMode.groupBy} onValueChange={value => setDisplayMode(prev => ({ ...prev, groupBy: value as 'assessee' | 'skill' }))}>
                    <S2_SelectTrigger className="w-auto sm:w-40" id="transcript-group-by-filter">
                        <S2_SelectValue placeholder="Select Grouping"/>
                    </S2_SelectTrigger>
                    <S2_SelectContent>
                        <S2_SelectItem value="assessee">Assessee</S2_SelectItem>
                        <S2_SelectItem value="skill">Skill</S2_SelectItem>
                    </S2_SelectContent>
                </S2_Select>
            </div>
            <div className="col-span-full flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground">
                <div className="font-semibold">Legend:</div>
                {CompetenceLevels.map(level => (
                    <div key={level} className="flex items-center gap-1">
                        <CompetenceLevelIndicator level={level}/> {CompetenceLevelTerms[level]}
                    </div>
                ))}
            </div>
        </div>

        {match(displayMode)
            .with({ groupBy: 'assessee' }, () => <>
                <ul className="flex flex-col gap-2">
                    {usedAssessees.map(assessee => {
                        const checksForAssessee = checksByUser
                            .filter(c => c.assesseeId === assessee.personId)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

                        return <li key={assessee.personId} className="border border-border text-sm rounded-md p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold ">{assessee.name}</div>
                                <div className="text-xs text-muted-foreground">{toPercentage(checksForAssessee.length / assignedSkills.length, { clamp: true })} coverage</div>
                            </div>
                            

                            <ul className="space-y-1">
                                {checksForAssessee.map(check => {
                                    const skill = skills.find(s => s.skillId === check.skillId)

                                    return <li key={check.skillCheckId} className="flex items-center gap-2 flex-wrap pl-2">
                                        <CompetenceLevelIndicator level={check.result as CompetenceLevel} />
                                        {/* <span>{CompetenceLevelTerms[check.result as CompetenceLevel] || check.result}</span>
                                        <span>for skill</span> */}
                                        <span>{skill?.name}</span>
                                        <span className="text-xs text-muted-foreground pl-2">{formatDistanceToNow(check.timestamp, { addSuffix: true })}</span>
                                    </li>
                                })}
                            </ul>
                        </li>
                    })}
                </ul>
                <Show when={unusedAssessees.length > 0}>
                    <div className="text-sm font-semibold mt-4">Assigned assessees without recorded checks:</div>
                    <ul className="flex flex-col gap-1 text-sm">
                        {unusedAssessees.map(assessee => 
                            <li key={assessee.personId} className="pl-2">
                                {assessee.name}
                            </li>
                        )}
                    </ul>
                </Show>
            </>)
            .with({ groupBy: 'skill' }, () => <>
                <ul className="flex flex-col gap-2">
                    {usedSkills.map(skill => {
                        const checksForSkill = checksByUser
                            .filter(c => c.skillId === skill.skillId)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

                        return <li key={skill.skillId} className="border border-border text-sm rounded-md p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold ">{skill.name}</div>
                                <div className="text-xs text-muted-foreground">{toPercentage(checksForSkill.length / assignedAssessees.length, { clamp: true })} coverage</div>
                            </div>

                            <ul className="list-disc space-y-1">
                                {checksForSkill.map(check => {
                                    const assessee = assignedAssessees.find(a => a.personId === check.assesseeId)

                                    return <li key={check.skillCheckId} className="flex items-center gap-2 flex-wrap pl-2">
                                        <CompetenceLevelIndicator level={check.result as CompetenceLevel} />
                                        <span>{assessee?.name}</span>
                                        
                                        <span className="text-muted-foreground pl-2">{formatDistanceToNow(check.timestamp, { addSuffix: true })}</span>
                                    </li>
                                })}
                                </ul>
                        </li>
                    })}
                </ul>
                <Show when={unusedSkills.length > 0}>
                    <div className="text-sm font-semibold mt-4">Assigned skills without recorded checks:</div>
                    <ul className="flex flex-col gap-1 text-sm">
                        {unusedSkills.map(skill => 
                            <li key={skill.skillId} className="pl-2">
                                {skill.name}
                            </li>
                        )}
                    </ul>
                </Show>
            </>)
            .exhaustive()
        }
    </div>
}