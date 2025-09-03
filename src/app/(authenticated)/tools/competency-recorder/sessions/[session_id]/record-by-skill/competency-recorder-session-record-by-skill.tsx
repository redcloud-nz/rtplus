/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { NotebookPenIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { AppPageContent, AppPageFooter } from '@/components/app-page'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useAssignedSkills } from '@/hooks/use-assigned-skills'
import { useSkillCheckStore_experimental } from '@/hooks/use-skill-check-store'
import { PersonRefData } from '@/lib/schemas/person'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'




export function CompetencyRecorder_Session_RecordBySkill_PageContent({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssignedAssessees.queryOptions({ sessionId }))
    const { data: skills } = useAssignedSkills({ sessionId })

    const [targetSkillId, setTargetSkillId] = useState<string>('')
    const skillCheckStore = useSkillCheckStore_experimental(sessionId)

    return <>
        <AppPageContent variant="full" hasFooter>
            <ScrollArea style={{ height: `calc(100vh - 98px)` }} className="flex flex-col gap-4 pl-4 pr-3">
                <div className="space-y-4 pt-2">
                    <div>
                        <Label>Skill</Label>
                        <div>
                            <Show 
                                when={assessees.length > 0}
                                fallback={<Alert title="No skills configured for the session." severity="warning" className="p-2.5"/>}
                            >
                                <Select
                                    value={targetSkillId} 
                                    onValueChange={(newSkillId) => {
                                        setTargetSkillId(newSkillId)
                                        if(newSkillId) skillCheckStore.loadChecks({ skillId: newSkillId })
                                    }}
                                    disabled={skillCheckStore.isDirty}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a skill..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                                                    
                                        {skills.map(skill => (
                                            <SelectItem key={skill.skillId} value={skill.skillId}>
                                                {skill.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Show>
                        </div>
                    </div>
                    <div className="grid grid-cols-[min(20%,--spacing(80))_1fr_1fr">
                        {assessees.map(assessee => 
                            <AssesseeRow
                                key={assessee.personId}
                                assessee={assessee}
                                disabled={!targetSkillId}
                                value={skillCheckStore.getCheck({ assesseeId: assessee.personId, skillId: targetSkillId })}
                                onValueChange={skillCheckStore.updateCheck({ assesseeId: assessee.personId, skillId: targetSkillId })}
                            />
                        )}
                    </div>
                </div>
            </ScrollArea>
        </AppPageContent>
        <AppPageFooter>
            <AsyncButton
                size="sm"
                label="Save"
                pending="Saving"
                disabled={!skillCheckStore.isDirty}
                onClick={async () => {
                    await skillCheckStore.saveChecks()
                    setTargetSkillId('')
                }}
                reset
            />
            <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                    skillCheckStore.reset()
                    setTargetSkillId('')
                }}
            >Clear</Button>
        </AppPageFooter>
    </>
}


interface AssesseeRowProps {
    assessee: PersonRefData
    disabled: boolean
    value: { result: string, notes: string, isDirty: boolean, prev: { result: string, notes: string } | null }
    onValueChange: (value: { result: string, notes: string }) => void
}

function AssesseeRow({ assessee, disabled, value, onValueChange }: AssesseeRowProps) {
    const resultChanged = value.prev ? value.result !== value.prev.result : true
    
    const [showNotes, setShowNotes] = useState(false)

    return <div className="col-span-3 grid grid-cols-subgrid items-center border-t border-zinc-950/5 py-1 gap-x-2 gap-y-1">
        <Label className="pl-1">{assessee.name}</Label>
        <ToggleGroup 
            type="single" 
            variant='outline' 
            size="sm" 
            value={value.result} 
            onValueChange={val => onValueChange({ ...value, result: val })} 
            disabled={disabled}
            className={cn(resultChanged && '*:data-[state=on]:ring-2')}
        
        >
            <ToggleGroupItem value="NotTaught" className="data-[state=on]:bg-yellow-600/10 data-[state=on]:text-yellow-700 ring-yellow-700/20">
                NT
            </ToggleGroupItem>
            <ToggleGroupItem value="NotCompetent" className="data-[state=on]:bg-red-600/10 data-[state=on]:text-red-700 ring-red-700/20">
                NC
            </ToggleGroupItem>
            <ToggleGroupItem value="Competent" className="data-[state=on]:bg-green-600/10 data-[state=on]:text-green-700 ring-green-700/20">
                C
            </ToggleGroupItem>
            <ToggleGroupItem value="HighlyConfident" className="data-[state=on]:bg-blue-600/10 data-[state=on]:text-blue-700 ring-blue-700/20">
                HC
            </ToggleGroupItem>
        </ToggleGroup>
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