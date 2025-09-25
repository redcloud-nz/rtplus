/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { NotebookPenIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CompetenceLevelRadioGroup } from '@/components/ui/competence-level-radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { GetCheckReturn, useSkillCheckStore_experimental } from '@/hooks/use-skill-check-store'
import { CompetenceLevel } from '@/lib/competencies'
import { SkillData } from '@/lib/schemas/skill'
import { useTRPC } from '@/trpc/client'




export function CompetencyRecorder_Session_RecordByAssessee_PageContent({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const [{ data: assessor }, { data: availablePackages }, { data: assignedAssessees }, { data: assignedSkillIds }] = useSuspenseQueries({
        queries: [
            trpc.currentUser.getPerson.queryOptions(),
            trpc.skills.getAvailablePackages.queryOptions(),
            trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId }),
            trpc.skillChecks.getSessionSkillIds.queryOptions({ sessionId })
        ]
    })

    const assignedSkills = useMemo(() => getAssignedSkills(availablePackages, assignedSkillIds), [availablePackages, assignedSkillIds])

    const [targetAssesseeId, setTargetAssesseeId] = useState<string>('')
    const skillCheckStore = useSkillCheckStore_experimental(sessionId)

    return <>
        <div className="px-4 py-2 space-y-1">
            <Label>Assessee</Label>
                
            <Show 
                when={assignedAssessees.length > 0}
                fallback={<Alert title="No assessees defined" severity="warning" className="p-2.5"/>}
            >
                <Select
                    value={targetAssesseeId} 
                    onValueChange={setTargetAssesseeId}
                    disabled={skillCheckStore.isDirty}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a person..."/>
                    </SelectTrigger>
                    <SelectContent>
                                                    
                        {assignedAssessees.map(assessee => (
                            <SelectItem key={assessee.personId} value={assessee.personId} disabled={assessee.personId === assessor.personId}>
                                {assessee.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Show>
        </div>
        <Separator orientation="horizontal"/>
        <Show when={targetAssesseeId != ''}>
            <ScrollArea style={{ height: `calc(100vh - var(--header-height) - 81px)` }} className="px-4 [&>[data-slot=scroll-area-viewport]]:pb-12">
                <div className="grid grid-cols-[min(20%,--spacing(80))_1fr_1fr divide-y divide-zinc-950/5">
                    {assignedSkills.map(skill => 
                        <SkillRow
                            key={skill.skillId}
                            skill={skill}
                            disabled={!targetAssesseeId}
                            savedValue={skillCheckStore.getCheck({ skillId: skill.skillId, assesseeId: targetAssesseeId })}
                            onValueChange={skillCheckStore.updateCheck({ skillId: skill.skillId, assesseeId: targetAssesseeId })}
                        />
                    )}
                </div>

                <FloatingFooter open={skillCheckStore.isDirty}>
                    <Button 
                        size="sm"
                        color="blue"
                        onClick={async () => {
                            await skillCheckStore.saveChecks()
                            setTargetAssesseeId('')
                        }}
                        disabled={!skillCheckStore.isDirty}
                    >Save</Button>
                        
                    <Button
                        size="sm"
                        color="red"
                        disabled={!skillCheckStore.isDirty}
                        onClick={() => skillCheckStore.reset()}
                    >Reset</Button>
                </FloatingFooter>
            </ScrollArea>

        </Show>
    </>
}


interface SkillRowProps {
    skill: SkillData
    disabled: boolean
    savedValue: GetCheckReturn
    onValueChange: (value: { result: string, notes: string }) => void
}

function SkillRow({ skill, disabled, savedValue: value, onValueChange }: SkillRowProps) {
    const resultChanged = value.savedValue ? value.result !== value.savedValue.result : true

    const [showNotes, setShowNotes] = useState(false)

    return <div className="col-span-3 grid grid-cols-subgrid items-center py-1 gap-x-2 gap-y-1">
        <Label className="pl-1">{skill.name}</Label>
        
        <CompetenceLevelRadioGroup 
            value={value.result as CompetenceLevel}
            prevValue={value.savedValue?.result as CompetenceLevel || null}
            onValueChange={newValue => onValueChange({ ...value, result: newValue })} 
            disabled={disabled}
            className={resultChanged ? '' : ''}
        />

        <Button variant="ghost" size="icon" onClick={() => setShowNotes(prev => !prev)} disabled={disabled}>
            <NotebookPenIcon/>
        </Button>
        <div>
            
        </div>
        { showNotes ? <div className="col-span-3 mb-2">
            <Textarea
                autoFocus
                placeholder="Notes..."
                maxLength={500}
                value={value.notes}
                onChange={ev => onValueChange({ ...value, notes: ev.target.value })}
                onBlur={ev => {
                    const newValue = ev.target.value.trim()
                    onValueChange({ ...value, notes: newValue })
                    if(!newValue) setShowNotes(false)
                }}
                disabled={disabled}
            />
        </div> : null }
    </div>
}