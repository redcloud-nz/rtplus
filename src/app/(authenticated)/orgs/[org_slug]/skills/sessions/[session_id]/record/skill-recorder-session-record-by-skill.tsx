/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ArrowUpIcon, NotebookPenIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CompetenceLevelRadioGroup } from '@/components/ui/competence-level-radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Paragraph } from '@/components/ui/typography'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { GetCheckReturn, useSkillCheckStore_experimental } from '@/hooks/use-skill-check-store'
import { CompetenceLevel } from '@/lib/competencies'
import { PersonRef } from '@/lib/schemas/person'
import { SkillId } from '@/lib/schemas/skill'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'




export function SkillRecorder_Session_RecordBySkill({ session }: { session: SkillCheckSessionData }) {

    const { assignedAssessees, assignedSkills } = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions({ }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ sessionId: session.sessionId }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ sessionId: session.sessionId })
        ],
        combine: ([{ data: availablePackages }, { data: assignedAssessees }, { data: assignedSkillIds }]) => {
            return { assignedAssessees, assignedSkills: getAssignedSkills(availablePackages, assignedSkillIds) }
        }
    })

    const [targetSkillId, setTargetSkillId] = useState<SkillId | null>(null)
    const skillCheckStore = useSkillCheckStore_experimental(session.sessionId)

    return <>
        <Show 
            when={assignedAssessees.length > 0}
            fallback={<Alert title="No skills configured for the session." severity="warning" className="p-2.5"/>}
        >
            <Select
                value={targetSkillId ?? ''} 
                onValueChange={newValue => setTargetSkillId(newValue ? newValue as SkillId : null)}
                disabled={skillCheckStore.isDirty}
            >
                <SelectTrigger autoFocus>
                    <SelectValue placeholder="Select a skill..."/>
                </SelectTrigger>
                <SelectContent>                  
                    {assignedSkills.map(skill => (
                        <SelectItem key={skill.skillId} value={skill.skillId}>
                            {skill.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Show>
        <Separator orientation="horizontal" className="my-2"/>
        
        <ScrollArea style={{ height: `calc(100vh - var(--header-height) - 115px)` }} className="px-4 [&>[data-slot=scroll-area-viewport]]:pb-12">
            { targetSkillId
                ? <>
                    <div className="grid grid-cols-[min(20%,--spacing(80))_1fr_1fr divide-y divide-zinc-950/5">
                        {assignedAssessees.map(assessee => 
                            <AssesseeRow
                                key={assessee.personId}
                                assessee={assessee}
                                disabled={!targetSkillId}
                                check={skillCheckStore.getCheck({ assesseeId: assessee.personId, skillId: targetSkillId })}
                                onValueChange={skillCheckStore.updateCheck({ assesseeId: assessee.personId, skillId: targetSkillId })}
                            />
                        )}
                    </div>

                    <FloatingFooter open={skillCheckStore.isDirty}>
                        <Button 
                            size="sm"
                            color="blue"
                            onClick={async () => {
                                await skillCheckStore.saveChecks()
                                setTargetSkillId(null)
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
                </>
                : <div className="flex flex-col items-center">
                    <ArrowUpIcon className="size-8"/>
                    <Paragraph>
                        Select a skill to start recording checks.
                    </Paragraph>
                </div>
            }
        </ScrollArea>               
    </>
}


interface AssesseeRowProps {
    assessee: PersonRef
    disabled: boolean
    check: GetCheckReturn
    onValueChange: (value: { result: string, notes: string }) => void
}

function AssesseeRow({ assessee, disabled, check: value, onValueChange }: AssesseeRowProps) {
    const resultChanged = value.savedValue ? value.result !== value.savedValue.result : true
    
    const [showNotes, setShowNotes] = useState(false)

    return <div className="col-span-3 grid grid-cols-subgrid items-center py-1 gap-x-2 gap-y-1">
        <Label className="pl-1">{assessee.name}</Label>

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