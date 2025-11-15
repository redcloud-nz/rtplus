/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { ArrowUpIcon, MessageSquareIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'


import { CompetenceLevelRadioGroup } from '@/components/controls/competence-level-radio-group'
import { Button } from '@/components/ui/button'
import { S2_Button } from '@/components/ui/s2-button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { Textarea } from '@/components/ui/textarea'
import { Paragraph } from '@/components/ui/typography'

import { getAssignedSkills } from '@/hooks/use-assigned-skills'
import { GetCheckReturn, useSkillCheckStore } from '@/hooks/use-skill-check-store'
import { CompetenceLevel } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'



/**
 * Skill Recorder Tab that allows recording multiple skill checks by selecting an assessee and then assessing all skills for that assessee.
 */
export function SkillRecorder_Session_RecordByAssessee({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const [{ data: availablePackages }, { data: assignedAssessees }, { data: assignedSkillIds }] = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId })
        ]
    })

    const assignedSkills = useMemo(() => getAssignedSkills(availablePackages, assignedSkillIds), [availablePackages, assignedSkillIds])

    const [targetAssesseeId, setTargetAssesseeId] = useState<PersonId | null>(null)
    const skillCheckStore = useSkillCheckStore(organization.orgId, session.sessionId)

    return <FieldGroup className="py-4">
        <Field 
            data-invalid={assignedAssessees.length == 0}
            orientation="responsive"
        >
            <FieldContent>
                <FieldLabel>Assessee</FieldLabel>
                <FieldDescription>Select the person being assessed</FieldDescription>
                {assignedAssessees.length == 0 && <FieldError>No assessees configured in this session.</FieldError>}
            </FieldContent>
            
            <S2_Select
                value={targetAssesseeId || ''} 
                onValueChange={(newValue) => setTargetAssesseeId(newValue ? newValue as PersonId : null)}
                disabled={skillCheckStore.isDirty}
            >
                <S2_SelectTrigger className="min-w-1/2">
                    <S2_SelectValue placeholder="Select a person..."/>
                </S2_SelectTrigger>
                <S2_SelectContent>
                                                
                    {assignedAssessees.map(assessee => (
                        <S2_SelectItem key={assessee.personId} value={assessee.personId}>
                            {assessee.name}
                        </S2_SelectItem>
                    ))}
                </S2_SelectContent>
            </S2_Select>
        </Field>

        <FieldSeparator />

        { targetAssesseeId 
            ? <>
                <FieldGroup className="mb-8">

                    {assignedSkills.map(skill => 
                        <SkillRow
                            key={skill.skillId}
                            skill={skill}
                            disabled={!targetAssesseeId}
                            savedValue={skillCheckStore.getCheck({ skillId: skill.skillId, assesseeId: targetAssesseeId })}
                            onValueChange={skillCheckStore.updateCheck({ skillId: skill.skillId, assesseeId: targetAssesseeId })}
                        />
                    )}
                </FieldGroup>

                <FloatingFooter open={skillCheckStore.isDirty}>
                    <Button
                        size="sm"
                        color="blue"
                        onClick={async () => {
                            await skillCheckStore.saveChecks()
                            setTargetAssesseeId(null)
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
                    Select a person to start recording their skills.
                </Paragraph>
            </div>
        }
    </FieldGroup>
}


interface SkillRowProps {
    skill: SkillData
    disabled: boolean
    savedValue: GetCheckReturn
    onValueChange: (value: { result: string, notes: string }) => void
}

/**
 * Row for a single skill in the by-assessee recording view.
 */
function SkillRow({ skill, disabled, savedValue: value, onValueChange }: SkillRowProps) {

    const [showNotes, setShowNotes] = useState(false)

    return <FieldGroup>
        <Field orientation="horizontal">
            <FieldLabel>{skill.name}</FieldLabel>
            
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
                placeholder="Comment..."
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