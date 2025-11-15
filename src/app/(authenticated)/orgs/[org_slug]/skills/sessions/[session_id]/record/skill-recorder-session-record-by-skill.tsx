/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ArrowUpIcon, MessageSquareIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'

import { CompetenceLevelRadioGroup } from '@/components/controls/competence-level-radio-group'
import { FloatingFooter } from '@/components/footer'
import { S2_Button } from '@/components/ui/s2-button'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'

import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { Textarea } from '@/components/ui/textarea'
import { Paragraph } from '@/components/ui/typography'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { GetCheckReturn, useSkillCheckStore } from '@/hooks/use-skill-check-store'
import { CompetenceLevel } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonRef } from '@/lib/schemas/person'
import { SkillId } from '@/lib/schemas/skill'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'



/**
 * Skill Recorder Tab that allows recording multiple skill checks by selecting a skill and then assessing all assessees for that skill.
 */
export function SkillRecorder_Session_RecordBySkill({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const { assignedAssessees, assignedSkills } = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId })
        ],
        combine: ([{ data: availablePackages }, { data: assignedAssessees }, { data: assignedSkillIds }]) => {
            return { assignedAssessees, assignedSkills: getAssignedSkills(availablePackages, assignedSkillIds) }
        }
    })

    const [targetSkillId, setTargetSkillId] = useState<SkillId | null>(null)
    const skillCheckStore = useSkillCheckStore(organization.orgId, session.sessionId)

    return <FieldGroup className="py-4">
        <Field 
            data-invalid={assignedSkills.length == 0}
            orientation="responsive"
        >
            <FieldContent>
                 <FieldLabel>Assessees</FieldLabel>
                <FieldDescription>Select the skill to assess.</FieldDescription>
                { assignedSkills.length == 0 && <FieldError>No skills configured in this session.</FieldError>}
            </FieldContent>
            <S2_Select
                value={targetSkillId ?? ''} 
                onValueChange={newValue => setTargetSkillId(newValue ? newValue as SkillId : null)}
                disabled={skillCheckStore.isDirty}
            >
                <S2_SelectTrigger aria-invalid={assignedSkills.length == 0} className="min-w-1/2">
                    <S2_SelectValue placeholder="Select a skill..."/>
                </S2_SelectTrigger>
                <S2_SelectContent>
                    {assignedSkills.map(skill => (
                        <S2_SelectItem key={skill.skillId} value={skill.skillId}>
                            {skill.name}
                        </S2_SelectItem>
                    ))}
                </S2_SelectContent>
            </S2_Select>
        </Field>

        <FieldSeparator/>

        {targetSkillId
            ? <>
                <FieldGroup>
                    {assignedAssessees.map(assessee => 
                        <AssesseeRow
                            key={assessee.personId}
                            assessee={assessee}
                            disabled={!targetSkillId}
                            check={skillCheckStore.getCheck({ assesseeId: assessee.personId, skillId: targetSkillId })}
                            onValueChange={skillCheckStore.updateCheck({ assesseeId: assessee.personId, skillId: targetSkillId })}
                        />
                    )}
                </FieldGroup>

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
    </FieldGroup>

}


interface AssesseeRowProps {
    assessee: PersonRef
    disabled: boolean
    check: GetCheckReturn
    onValueChange: (value: { result: string, notes: string }) => void
}

/**
 * Row for a single assessee in the by-skill recording view.
 */
function AssesseeRow({ assessee, disabled, check: value, onValueChange }: AssesseeRowProps) {
    
    const [showNotes, setShowNotes] = useState(false)

    return <FieldGroup>
        <Field orientation="horizontal">
            <FieldLabel>{assessee.name}</FieldLabel>

            <CompetenceLevelRadioGroup 
                orientation="horizontal"
                value={value.result as CompetenceLevel}
                prevValue={value.savedValue?.result as CompetenceLevel || null}
                onValueChange={newValue => onValueChange({ ...value, result: newValue })} 
                disabled={disabled}
            />

            <S2_Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotes(prev => !prev)}
                disabled={disabled}
                className="text-muted-foreground"
            >
                <MessageSquareIcon className={cn(value.notes && "fill-neutral-300")}/>
            </S2_Button>

        </Field>
            
        { showNotes ? <Field orientation="responsive">
            <FieldContent>
                <FieldLabel className="text-muted-foreground pl-8">Assessor Comments</FieldLabel>
            </FieldContent>
            <Textarea
                autoFocus
                className="min-w-1/2"
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
        </Field> : null }
    </FieldGroup>
}