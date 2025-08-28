/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useSkillCheckStore_experimental } from '@/hooks/use-skill-check-store'
import { CompetenceLevelTerms } from '@/lib/competencies'
import { PersonData, PersonRefData } from '@/lib/schemas/person'
import { useTRPC } from '@/trpc/client'

import { useAssignedSkills } from '../use-assigned-skills'


export function CompetencyRecorder_Session_RecordBySkill_Card({ sessionId }: { sessionId: string }) {

    const trpc = useTRPC()

    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssignedAssessees.queryOptions({ sessionId }))
    const { data: skills } = useAssignedSkills({ sessionId })

    const [targetSkillId, setTargetSkillId] = useState<string>('')
    const skillCheckStore = useSkillCheckStore_experimental(sessionId)

    return <Card>
        <CardHeader>
            <CardTitle>Record By Skill</CardTitle>
            <CardActions>
                <Select
                    value={targetSkillId} 
                    onValueChange={(newSkillId)=> {
                        setTargetSkillId(newSkillId)
                        if(newSkillId) skillCheckStore.loadChecks({ skillId: newSkillId })
                    }}
                    disabled={skillCheckStore.isDirty}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Select a skill..." />
                    </SelectTrigger>
                    <SelectContent>
                        {skills.map(skill => (
                            <SelectItem key={skill.skillId} value={skill.skillId}>
                                {skill.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Separator orientation="vertical"/>
                <CardExplanation>
                    <div>This form allows you to record multiple checks for a particular skill within the session.</div>
                    
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <Form>
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
                    <div className="h-10 pt-1 flex items-center gap-2 col-span-full border-t border-zinc-950/5">
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
                    </div>
                </div>
            </Form>
        </CardContent>
    </Card>
}


interface AssesseeRowProps {
    assessee: PersonRefData
    disabled: boolean;
    value: { result: string, notes: string }
    onValueChange: (value: { result: string, notes: string }) => void;
}

function AssesseeRow({ assessee, disabled, value, onValueChange }: AssesseeRowProps) {
    return <div className="col-span-3 grid grid-cols-subgrid border-t border-zinc-950/5 py-1 first:border-none md:gap-2">
        <Label className="pt-3 pl-2">{assessee.name}</Label>
        <div>
            <Select 
                value={value.result}
                onValueChange={newValue => onValueChange({ ...value, result: newValue })}
                disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder="Competence level..." />
            </SelectTrigger>
            <SelectContent>
                    {Object.entries(CompetenceLevelTerms).map(([key, label]) =>
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                )}
            </SelectContent>
        </Select>
        </div>
        <div>
            <Input
                type="text"
                placeholder="Notes..."
                maxLength={500}
                value={value.notes}
                onChange={ev => onValueChange({ ...value, notes: ev.target.value })}
                disabled={disabled}
            />
        </div>
    </div>
}