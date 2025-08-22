/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

/* eslint-disable */
'use client'

import { useState } from 'react'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevelTerms } from '@/lib/competencies'
import { nanoId16 } from '@/lib/id'
import { PersonData } from '@/lib/schemas/person'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'



interface RecordingState {
    target: {skillId: string }
    items: { assesseeId: string, skillCheckId: string, current: { result: string, notes: string }, prev: SkillCheckData | null, dirty: boolean }[]
    dirty: boolean
}

export function CompetencyRecorder_Session_RecordBySkill_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    const { data: assessor } = useSuspenseQuery(trpc.currentUser.getPerson.queryOptions())
    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    const { data: skills } = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))
    const { data: existingChecks } = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId, assessorId: 'me' }))

    const [state, setState] = useState<RecordingState>({
        target: { skillId: '' },
        items: [],
        dirty: false
    })

    function handleChangeSkill(skillId: string) {

        if(skillId) {
            const items = assessees.map(assessee => {
                const foundCheck = existingChecks.find(check => check.skillId === skillId && check.assesseeId === assessee.personId)
                return {
                    assesseeId: assessee.personId,
                    skillCheckId: foundCheck ? foundCheck.skillCheckId : nanoId16(),
                    current: {
                        result: foundCheck ? foundCheck.result : '',
                        notes: foundCheck ? foundCheck.notes : ''
                    },
                    prev: foundCheck ?? null,
                    dirty: false
                }
            })

            setState({ target: { skillId }, items: items, dirty: false })
        }
    }

    function handleUpdateFormData(assesseeId: string): (data: { result: string, notes: string }) => void {
        return (update) => {
            setState(prevState => {
                const updatedChecks = prevState.items.map(check => {
                    if (check.assesseeId === assesseeId) {
                        return {
                            ...check,
                            current: update,
                            dirty: check.prev 
                                ? check.prev.result != update.result || check.prev.notes !== update.notes 
                                : update.result != '' || update.notes != '',
                        }
                    }
                    return check
                })
                return { ...prevState, items: updatedChecks, dirty: updatedChecks.some(item => item.dirty) }
            })
        }
    }

    function handleReset() {

    }

    return <Card>
        <CardHeader>
            <CardTitle>Record By Skill</CardTitle>
            <CardActions>
                <Select
                    value={state.target.skillId} 
                    onValueChange={handleChangeSkill}
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
                            disabled={!state.target.skillId}
                            value={state.items.find(item => item.assesseeId === assessee.personId)?.current || { result: '', notes: '' }}
                            onValueChange={handleUpdateFormData(assessee.personId)}
                        />
                    )}
                    <div className="h-10 pt-1 flex items-center gap-2 col-span-full border-t border-zinc-950/5">
                        <AsyncButton
                            size="sm"
                            label="Save"
                            pending="Saving"
                            disabled={!state.dirty}
                        />
                        <Button variant="ghost" size="sm" onClick={handleReset}>Clear</Button>
                    </div>
                </div>
            </Form>
        </CardContent>
    </Card>
}


interface AssesseeRowProps {
    assessee: PersonData;
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
                <SelectValue placeholder="Select competence level..." />
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